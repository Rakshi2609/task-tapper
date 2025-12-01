import mongoose from "mongoose";
import User from "./models/User.js";
import Community from "./models/Community.js";
import CommunityDept from "./models/CommunityDept.js";
import Team from "./models/Team.js";

const MONGO_URI = "mongodb://localhost:27017/love-war";

async function seed() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGO_URI);

    console.log("Clearing old data...");
    await User.deleteMany({});
    await Community.deleteMany({});
    await CommunityDept.deleteMany({});
    await Team.deleteMany({});

    // ---------------------------------------------------------
    // 1. CREATE DUMMY USERS
    // ---------------------------------------------------------
    console.log("\nCreating 10 Dummy Users...");
    const users = await User.insertMany([
      { username: "User1", email: "u1@test.com" },
      { username: "User2", email: "u2@test.com" },
      { username: "User3", email: "u3@test.com" },
      { username: "User4", email: "u4@test.com" },
      { username: "User5", email: "u5@test.com" },
      { username: "User6", email: "u6@test.com" },
      { username: "User7", email: "u7@test.com" },
      { username: "User8", email: "u8@test.com" },
      { username: "User9", email: "u9@test.com" },
      { username: "User10", email: "u10@test.com" }
    ]);
    console.log(users);

    // ---------------------------------------------------------
    // 2. COMMUNITIES (3 types for testing)
    // ---------------------------------------------------------

    console.log("\nCreating Communities...");

    // A — FULL community with everything
    const c1 = await Community.create({
      CreatedBy: users[0]._id,
      members: [users[1]._id, users[2]._id, users[3]._id],
      name: "Tech Titans",
      description: "Full community with teams & departments",
      totalMembers: 3,
      waitingApproval: [users[4]._id, users[5]._id]
    });

    // B — Community with NO members
    const c2 = await Community.create({
      CreatedBy: users[6]._id,
      members: [],
      name: "Empty Community",
      description: "This one has no members",
      totalMembers: 0,
      waitingApproval: []
    });

    // C — Community with only waitingApproval
    const c3 = await Community.create({
      CreatedBy: users[7]._id,
      members: [],
      name: "Pending Community",
      description: "Users waiting approval",
      totalMembers: 0,
      waitingApproval: [users[8]._id, users[9]._id]
    });

    console.log({ c1, c2, c3 });

    // ---------------------------------------------------------
    // 3. DEPARTMENTS for communities
    // ---------------------------------------------------------

    console.log("\nCreating Departments...");

    const depts = await CommunityDept.insertMany([
      {
        CreatedBy: users[0]._id,
        community: c1._id,
        name: "Development",
        description: "Full stack & Backend",
        totalMembers: 2
      },
      {
        CreatedBy: users[1]._id,
        community: c1._id,
        name: "Design",
        description: "UI / UX Team",
        totalMembers: 1
      },

      // c2 gets no departments → To test empty case

      // c3 one department
      {
        CreatedBy: users[7]._id,
        community: c3._id,
        name: "Operations",
        description: "Handling approvals",
        totalMembers: 0
      }
    ]);

    console.log(depts);

    // ---------------------------------------------------------
    // 4. TEAMS (TASKS)
    // ---------------------------------------------------------

    console.log("\nCreating Teams (Tasks)...");

    const teams = await Team.insertMany([
      // Teams under Community 1
      {
        createdBy: users[0]._id.toString(),
        taskName: "Backend Route",
        taskDescription: "Community routes setup",
        assignedTo: users[2]._id.toString(),
        assignedName: "User3",
        communityDept: depts[0]._id,
        community: c1._id,
        taskFrequency: "Weekly",
        priority: "High"
      },
      {
        createdBy: users[1]._id.toString(),
        taskName: "UI Revamp",
        taskDescription: "Fix UI bugs",
        assignedTo: users[3]._id.toString(),
        assignedName: "User4",
        communityDept: depts[1]._id,
        community: c1._id,
        taskFrequency: "Daily",
        priority: "Medium"
      },

      // Community 2 has NO teams → test empty teams case

      // Community 3 one team without department
      {
        createdBy: users[7]._id.toString(),
        taskName: "Approval Manager",
        taskDescription: "Handle user approvals",
        assignedTo: users[9]._id.toString(),
        assignedName: "User10",
        community: c3._id,
        taskFrequency: "OneTime",
        priority: "Low"
      }
    ]);

    console.log(teams);

    console.log("\n🔥 SEEDING COMPLETE. Now test your APIs.");

    console.log(`
----------------------------------------
TEST ALL ROUTES NOW:

1️⃣ Get all communities
GET /communities/

2️⃣ Get teams in a community
GET /communities/${c1._id}/teams
GET /communities/${c2._id}/teams   ← no teams
GET /communities/${c3._id}/teams   ← 1 team

3️⃣ Get departments for a community
GET /communities/${c1._id}/departments
GET /communities/${c2._id}/departments ← no depts
GET /communities/${c3._id}/departments ← 1 dept

4️⃣ Get members for a community
GET /communities/${c1._id}/members
GET /communities/${c2._id}/members ← empty
GET /communities/${c3._id}/members ← empty

----------------------------------------
`);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
