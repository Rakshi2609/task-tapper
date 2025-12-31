import Team from "./models/Team.js";
import RecurringTask from "./models/recurringTaskModel.js";
import User from "./models/User.js";

// Helper function to check if a task instance already exists for a specific date
const taskInstanceExists = async (recurringTaskId, dueDate) => {
  const startOfDay = new Date(dueDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(dueDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingTask = await Team.findOne({
    recurringTaskId: recurringTaskId,
    dueDate: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  return !!existingTask;
};

// Main function to generate recurring task instances
export const generateRecurringTaskInstances = async () => {
  console.log("🔁 Running recurring task instance generator");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all active recurring tasks
    const recurringTasks = await RecurringTask.find({
      taskFrequency: { $in: ["Daily", "Weekly", "Monthly"] },
      taskStartDate: { $lte: today },
      $or: [
        { taskEndDate: null },
        { taskEndDate: { $gte: today } }
      ]
    }).populate('taskAssignedTo taskAssignedBy');

    console.log(`📋 Found ${recurringTasks.length} active recurring tasks to process`);

    const results = {
      created: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    for (const recurringTask of recurringTasks) {
      try {
        const startDate = new Date(recurringTask.taskStartDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = recurringTask.taskEndDate ? new Date(recurringTask.taskEndDate) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        let shouldCreateTask = false;

        // Check if we should create a task for today based on frequency
        if (recurringTask.taskFrequency === "Daily") {
          // For daily tasks, create every day except Sunday (0)
          const dayOfWeek = today.getDay();
          shouldCreateTask = dayOfWeek !== 0; // Skip Sunday
        } else if (recurringTask.taskFrequency === "Weekly") {
          // For weekly tasks, check if today is 7 days from start date
          const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
          shouldCreateTask = daysDiff % 7 === 0;
        } else if (recurringTask.taskFrequency === "Monthly") {
          // For monthly tasks, check if today's date matches start date's day
          shouldCreateTask = today.getDate() === startDate.getDate();
        }

        // Only create if within date range and doesn't already exist
        if (shouldCreateTask) {
          if (endDate && today > endDate) {
            results.skipped++;
            results.details.push({
              task: recurringTask.taskName,
              reason: "End date passed"
            });
            continue;
          }

          const alreadyExists = await taskInstanceExists(recurringTask._id, today);
          
          if (!alreadyExists) {
            const assignedToEmail = recurringTask.taskAssignedTo?.email || recurringTask.taskAssignedTo;
            const assignedToName = recurringTask.taskAssignedTo?.username || assignedToEmail;

            const newTaskInstance = new Team({
              createdBy: recurringTask.createdBy,
              taskName: recurringTask.taskName,
              taskDescription: recurringTask.taskDescription,
              assignedTo: assignedToEmail,
              assignedName: assignedToName,
              taskFrequency: recurringTask.taskFrequency,
              dueDate: new Date(today),
              priority: recurringTask.priority || "Medium",
              recurringTaskId: recurringTask._id,
              community: recurringTask.community || null,
              communityDept: recurringTask.communityDept || null,
            });

            await newTaskInstance.save();
            
            // Update user task counts
            const assignedUser = await User.findOne({ email: assignedToEmail });
            if (assignedUser) {
              assignedUser.TasksAssigned = (assignedUser.TasksAssigned || 0) + 1;
              assignedUser.TasksNotStarted = (assignedUser.TasksNotStarted || 0) + 1;
              await assignedUser.save();
            }

            results.created++;
            results.details.push({
              task: recurringTask.taskName,
              reason: "Created successfully",
              dueDate: today.toDateString()
            });

            console.log(`✅ Created ${recurringTask.taskFrequency} task instance: "${recurringTask.taskName}" for ${assignedToName} on ${today.toDateString()}`);
          } else {
            results.skipped++;
            results.details.push({
              task: recurringTask.taskName,
              reason: "Instance already exists for today"
            });
            console.log(`⏭️  Task instance already exists for "${recurringTask.taskName}" on ${today.toDateString()}`);
          }
        } else {
          results.skipped++;
          results.details.push({
            task: recurringTask.taskName,
            reason: "Not scheduled for today based on frequency"
          });
        }
      } catch (taskErr) {
        results.errors++;
        results.details.push({
          task: recurringTask.taskName,
          reason: `Error: ${taskErr.message}`
        });
        console.error(`❌ Error processing recurring task ${recurringTask._id}:`, taskErr.message);
      }
    }

    console.log("✅ Recurring task generation completed", results);
    return results;
  } catch (err) {
    console.error("❌ Error in recurring task generator:", err);
    throw err;
  }
};

// Track last generation time in memory (resets on server restart)
let lastGenerationDate = null;

// Helper function to check if tasks need to be generated today
export const shouldGenerateTasksToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!lastGenerationDate) return true;
  
  const lastGen = new Date(lastGenerationDate);
  lastGen.setHours(0, 0, 0, 0);
  
  return today > lastGen;
};

// Wrapper function to auto-generate tasks if needed
export const ensureTasksGeneratedToday = async () => {
  if (shouldGenerateTasksToday()) {
    console.log("🔄 Auto-generating recurring tasks for today...");
    const results = await generateRecurringTaskInstances();
    lastGenerationDate = new Date();
    return results;
  }
  console.log("✅ Tasks already generated for today");
  return { alreadyGenerated: true };
};

console.log("📅 Recurring task scheduler module loaded");
