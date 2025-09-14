import mongoose from "mongoose";

/**
 * Connect to MongoDB with optional retry logic and cleaner diagnostics.
 * Environment variables:
 *  - MONGO_URI (required) e.g. mongodb+srv://user:pass@cluster0.wk1t7xa.mongodb.net/mydb?retryWrites=true&w=majority
 *  - MONGO_DB_NAME (optional) if not embedded in URI path
 *  - MONGO_MAX_RETRIES (optional, default 3)
 *  - MONGO_RETRY_DELAY_MS (optional, default 3000)
 */
export const connectDB = async () => {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		console.error("❌ MONGO_URI not set. Please define it in your environment (.env)");
		process.exit(1);
	}

	const dbName = process.env.MONGO_DB_NAME; // Optional override
	const maxRetries = parseInt(process.env.MONGO_MAX_RETRIES || "3", 10);
	const retryDelay = parseInt(process.env.MONGO_RETRY_DELAY_MS || "3000", 10);

	// Mask password for log output
	const safeUri = (() => {
		try {
			const u = new URL(uri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
			if (u.password) {
				const masked = u.password.length > 4 ? `${u.password.slice(0, 2)}***${u.password.slice(-2)}` : '***';
				u.password = masked; // won't actually set; constructing manually below
				return `${u.protocol === 'http:' ? (uri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://') : ''}${u.username}:${masked}@${u.host}${u.pathname}`;
			}
		} catch { /* ignore */ }
		return uri.split('@').length === 2 ? uri.replace(/:(.*)@/, ':***@') : uri;
	})();

	let attempt = 0;
	while (attempt <= maxRetries) {
		try {
			attempt++;
			console.log(`🟡 Connecting to MongoDB (attempt ${attempt}/${maxRetries + 1}) -> ${safeUri}`);
			const conn = await mongoose.connect(uri, {
				dbName: dbName || undefined,
				serverSelectionTimeoutMS: 8000,
			});
			console.log(`✅ MongoDB Connected: host=${conn.connection.host} db=${conn.connection.name}`);
			return conn;
		} catch (error) {
			const isLast = attempt > maxRetries;
			console.error(`❌ MongoDB connection failed (attempt ${attempt}): ${error.message}`);
			// Specific guidance for common SRV / DNS issues
			if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
				console.error('🔎 DNS / SRV lookup failed. Check:');
				console.error('  • Internet connectivity');
				console.error('  • Local DNS allows SRV record lookups');
				console.error('  • Atlas cluster URL is correct (copy from Atlas)');
				console.error('  • If behind firewall / VPN, try different network');
			}
			if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
				console.error('🔐 Authentication failure: verify username/password and URL encoding of special characters.');
			}
			if (isLast) {
				console.error('⛔ Exhausted MongoDB connection attempts. Exiting.');
				process.exit(1);
			} else {
				console.log(`⏳ Retrying in ${retryDelay}ms...`);
				await new Promise(r => setTimeout(r, retryDelay));
			}
		}
	}
};