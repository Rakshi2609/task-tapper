import User from '../models/User.js'
import Team from '../models/Team.js'; 
import { UserDetail } from '../models/userDetail.js';


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
    const tasks = await Team.find({ assignedTo: email });

    res.status(200).json({
      success: true,
      tasks,
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
    const tasks = await Team.find({ createdBy: email });
    console.log(`[getAssignedByMe] Found ${tasks.length} tasks`);
    res.json({ tasks });
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
