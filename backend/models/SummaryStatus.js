// backend/models/SummaryStatus.js
import mongoose from 'mongoose';

const SummaryStatusSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true }, // e.g., '2025-07-09'
});

export default mongoose.model('SummaryStatus', SummaryStatusSchema);
