import cron from "node-cron";
import Team from "./models/Team.js";

// Schedule to run every day at 12:05 AM
cron.schedule("5 19 * * *", async () => {
  console.log("🔁 Running daily task generator");

  try {
    const today = new Date();

    // Find all recurring tasks
    const tasks = await Team.find({
      taskFrequency: { $in: ["Daily", "Weekly", "Monthly"] },
    });

    for (let task of tasks) {
      let shouldGenerate = false;

      // Calculate time difference
      const lastDue = new Date(task.dueDate);
      const now = new Date();

      const diffDays = Math.floor((now - lastDue) / (1000 * 60 * 60 * 24));

      if (task.taskFrequency === "Daily" && diffDays >= 1) shouldGenerate = true;
      else if (task.taskFrequency === "Weekly" && diffDays >= 7) shouldGenerate = true;
      else if (task.taskFrequency === "Monthly" && diffDays >= 30) shouldGenerate = true;

      if (shouldGenerate) {
        const newTask = new Team({
          createdBy: task.createdBy,
          task: task.task,
          assignedTo: task.assignedTo,
          assignedName: task.assignedName,
          taskFrequency: task.taskFrequency,
          dueDate: new Date(), // today
          priority: task.priority,
        });

        await newTask.save();
        console.log(`✅ New ${task.taskFrequency} task created for ${task.assignedName}`);
      }
    }
  } catch (err) {
    console.error("❌ Error in cron job:", err);
  }
});
