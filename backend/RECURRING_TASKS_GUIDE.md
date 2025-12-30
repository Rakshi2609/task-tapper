# Recurring Tasks - Day-by-Day Generation Guide

## Overview
The recurring task system has been updated to create task instances **on the day they are due**, rather than creating all instances upfront. This means:

- A recurring task created on Dec 31st with end date Jan 5th will:
  - Create the **first task instance on Dec 31st**
  - Create the **second task instance on Jan 1st** (next day)
  - Create the **third task instance on Jan 2nd**
  - And so on until Jan 5th

## How It Works

### 1. **Creating a Recurring Task**
When you create a recurring task through the API, you're creating a **template** that defines:
- `taskName`: Name of the task
- `taskDescription`: Description
- `taskFrequency`: Daily, Weekly, or Monthly
- `taskStartDate`: When to start generating task instances
- `taskEndDate`: When to stop (optional - can be null for indefinite)
- `priority`: Low, Medium, or High
- `taskAssignedTo`: Who should receive the task instances
- `taskAssignedBy`: Who created the recurring task
- `createdBy`: Creator's email

**The recurring task itself is NOT a task** - it's a template that the scheduler uses to generate actual task instances.

### 2. **Automated Daily Task Generation**
Every day at **midnight (00:00)**, the system automatically:

1. Finds all active recurring tasks where:
   - Start date has passed
   - End date hasn't been reached (or is null)
   
2. For each recurring task, checks if a task should be created today:
   - **Daily**: Creates a task every day
   - **Weekly**: Creates a task every 7 days from start date
   - **Monthly**: Creates a task on the same day of month as start date

3. Checks if a task instance already exists for today (prevents duplicates)

4. Creates a new task instance in the `Team` collection with:
   - All details from the recurring task template
   - `dueDate` set to today's date
   - `recurringTaskId` linking back to the template

5. Updates the assigned user's task counts

### 3. **Task Instance vs Recurring Task**
- **RecurringTask** (in `recurringtasks` collection): The template
- **Team** (in `teams` collection): The actual task instances that users see and complete

### 4. **Example Workflow**

#### Creating a Recurring Task (Dec 31st):
```javascript
POST /api/recurring/create
{
  "taskName": "Daily Standup",
  "taskDescription": "Attend daily standup meeting",
  "taskFrequency": "Daily",
  "taskStartDate": "2024-12-31",
  "taskEndDate": "2025-01-05",
  "taskAssignedTo": "user@example.com",
  "taskAssignedBy": "manager@example.com",
  "createdBy": "manager@example.com",
  "priority": "High"
}
```

#### What Happens:
- **Dec 31, 00:00**: Scheduler creates Task #1 (due Dec 31)
- **Jan 1, 00:00**: Scheduler creates Task #2 (due Jan 1)
- **Jan 2, 00:00**: Scheduler creates Task #3 (due Jan 2)
- **Jan 3, 00:00**: Scheduler creates Task #4 (due Jan 3)
- **Jan 4, 00:00**: Scheduler creates Task #5 (due Jan 4)
- **Jan 5, 00:00**: Scheduler creates Task #6 (due Jan 5)
- **Jan 6, 00:00**: No task created (end date reached)

## Manual Testing

For testing purposes without waiting for midnight, use the manual trigger endpoint:

```bash
GET http://localhost:5000/api/trigger-recurring-tasks
```

This will immediately run the same logic as the midnight scheduler.

## Database Schema Changes

### RecurringTask Model (Template)
```javascript
{
  taskName: String,
  taskDescription: String,
  taskFrequency: "Daily" | "Weekly" | "Monthly",
  taskStartDate: Date,
  taskEndDate: Date (nullable),
  priority: "Low" | "Medium" | "High",
  taskAssignedTo: ObjectId (ref: User),
  taskAssignedBy: ObjectId (ref: User),
  createdBy: String,
  community: ObjectId (optional),
  communityDept: ObjectId (optional)
}
```

### Team Model (Task Instance)
```javascript
{
  taskName: String,
  taskDescription: String,
  taskFrequency: "Daily" | "Weekly" | "Monthly" | "OneTime",
  dueDate: Date,
  priority: String,
  assignedTo: String (email),
  assignedName: String,
  createdBy: String,
  recurringTaskId: ObjectId (ref: RecurringTask), // NEW FIELD
  completedDate: Date,
  startTime: Date,
  endTime: Date,
  community: ObjectId,
  communityDept: ObjectId
}
```

## Benefits of This Approach

1. **No Clutter**: Users don't see hundreds of future tasks all at once
2. **Flexibility**: Can modify recurring task template without affecting future instances
3. **Performance**: Database isn't filled with tasks that may never be completed
4. **Accurate Due Dates**: Each task is created on its actual due date
5. **Natural Flow**: Tasks appear when they're actually relevant

## Scheduler Configuration

The scheduler runs using `node-cron` and is configured to run at:
- **Time**: 00:00 (midnight) every day
- **Cron Expression**: `"0 0 * * *"`

The scheduler is automatically started when the server starts (imported in `server.js`).

## Important Notes

- The scheduler only creates tasks for **today's date**
- If the server is down during midnight, tasks for that day won't be created automatically
- Use the manual trigger endpoint to catch up on missed days
- Deleting a recurring task **does not delete** already created task instances
- Each task instance has a `recurringTaskId` field to track which template it came from

## Troubleshooting

### Tasks Not Being Created?
1. Check if recurring task `taskStartDate` is in the past
2. Check if `taskEndDate` is in the future (or null)
3. Verify the server is running at midnight
4. Check server logs for errors
5. Use manual trigger endpoint to test: `GET /api/trigger-recurring-tasks`

### Duplicate Tasks?
The system prevents duplicates by checking if a task instance already exists for:
- Same `recurringTaskId`
- Same `dueDate` (same day)

### Weekly Tasks Not Creating?
Weekly tasks create every 7 days from the `taskStartDate`. Make sure you're checking on the correct day of the week.

### Monthly Tasks Not Creating?
Monthly tasks create on the same day of month as the `taskStartDate`. If the start date is the 31st, it won't create in months with fewer days.
