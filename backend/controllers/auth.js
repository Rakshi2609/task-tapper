import User from '../models/User.js'
import Team from '../models/Team.js'; 
import { UserDetail } from '../models/userDetail.js';
import RecurringTask from '../models/recurringTaskModel.js';
import { ensureTasksGeneratedToday } from '../taskScheduler.js';


export const glogin = async (req, res) => {
  const { email } = req.body || {};
  
  console.log("RECEIVED EMAIL FROM FRONTEND:", email); // add this line

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    console.log("login entered");
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Logged in Successfully",
      user: user._doc,
    });
  } catch (err) {
    console.log("Login Failed");
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const gsignup = async (req, res) => {
    const {email, username} = req.body;
    try{
    const check = await User.findOne({email});
    if(check){
        console.log("SignUp failed")
        return res.status(400).json({ success: false, message: "User already exists" });
    }else{
        console.log("SignUp Successfull")
        const user = new User({
            email,
            username,
        })
        await user.save();
        res.status(200).json({
            success:true,
            message:"SignUp in Successfully",
            user : {
                ...user._doc,
            },
        })
    }
}
    
    catch(err){
        console.log("Error in Sign Up")
        console.log(err)
    }

}



export const getUserProfile = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Get User Profile Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserTasks = async (req, res) => {
  const { email } = req.params;

  try {
    // Auto-generate recurring tasks if not done today
    await ensureTasksGeneratedToday();

    // Get user by email to get the user ID
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch one-time tasks (Team model)
    const oneTimeTasks = await Team.find({ assignedTo: email });

    // Fetch recurring tasks assigned to this user
    const recurringTasks = await RecurringTask.find({ taskAssignedTo: user._id })
      .populate('taskAssignedBy', 'email username')
      .populate('taskAssignedTo', 'email username')
      .populate('community', 'name');

    // Transform recurring tasks to match the format of one-time tasks
    const formattedRecurringTasks = recurringTasks.map(rt => ({
      _id: rt._id,
      taskName: rt.taskName,
      taskDescription: rt.taskDescription,
      taskFrequency: rt.taskFrequency,
      priority: rt.priority,
      dueDate: rt.taskStartDate,
      completedDate: rt.completedDate,
      assignedTo: rt.taskAssignedTo?.email || email,
      createdBy: rt.taskAssignedBy?.email || rt.createdBy?.email,
      communityName: rt.community?.name,
      departmentName: null,
      isRecurring: true
    }));

    // Combine both task types
    const allTasks = [...oneTimeTasks, ...formattedRecurringTasks];

    res.status(200).json({
      success: true,
      tasks: allTasks,
    });
  } catch (err) {
    console.error("Get User Tasks Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get tasks assigned BY the user (creator)
export const getAssignedByMe = async (req, res) => {
  const { email } = req.query;
  console.log(`[getAssignedByMe] Fetching tasks created by ${email}`);

  try {
    // Get user by email to get the user ID
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch one-time tasks created by this user
    const oneTimeTasks = await Team.find({ createdBy: email });

    // Fetch recurring tasks assigned by this user
    const recurringTasks = await RecurringTask.find({ taskAssignedBy: user._id })
      .populate('taskAssignedBy', 'email username')
      .populate('taskAssignedTo', 'email username')
      .populate('community', 'name');

    // Transform recurring tasks to match the format
    const formattedRecurringTasks = recurringTasks.map(rt => ({
      _id: rt._id,
      taskName: rt.taskName,
      taskDescription: rt.taskDescription,
      taskFrequency: rt.taskFrequency,
      priority: rt.priority,
      dueDate: rt.taskStartDate,
      completedDate: rt.completedDate,
      assignedTo: rt.taskAssignedTo?.email,
      createdBy: rt.taskAssignedBy?.email || email,
      communityName: rt.community?.name,
      departmentName: null,
      isRecurring: true
    }));

    // Combine both task types
    const allTasks = [...oneTimeTasks, ...formattedRecurringTasks];

    console.log(`[getAssignedByMe] Found ${allTasks.length} tasks (${oneTimeTasks.length} one-time, ${recurringTasks.length} recurring)`);
    res.json({ tasks: allTasks });
  } catch (err) {
    console.error(`[getAssignedByMe] Error:`, err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Route to get a user's detailed information (phone number, role)
 * by their email address.
 * It also populates the linked User data for completeness.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
// Save or update user detail (phone, role)
export const getUserDetail = async (req, res) => {
  const { email, phoneNumber, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let userDetail = await UserDetail.findOne({ user: user._id });

    if (userDetail) {
      // Update
      userDetail.phoneNumber = phoneNumber;
      userDetail.role = role;
      await userDetail.save();
    } else {
      // Create
      userDetail = new UserDetail({ user: user._id, phoneNumber, role });
      await userDetail.save();
    }

    return res.status(200).json({
      success: true,
      message: "User details saved successfully",
      userDetail
    });
  } catch (err) {
    console.error("[saveUserDetail] Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Fetch user detail by email (read-only)
export const fetchUserDetailByEmail = async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const userDetail = await UserDetail.findOne({ user: user._id }).lean();
    return res.status(200).json({ success: true, userDetail: userDetail || null });
  } catch (err) {
    console.error("[fetchUserDetailByEmail] Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
