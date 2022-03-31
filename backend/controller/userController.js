const catchAsyncErrors=require('../middleware/catchAsyncErrors')
const User=require("../models/userModel")
const ErrorHandler = require('../utils/errorhandler');
const bcrypt = require('bcryptjs');
const sendToken = require('../utils/jwtToken');
const sendEmail= require('../utils/sentEmail')
const crypto = require('crypto')
const cloudinary = require('cloudinary')


//Register a User
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:"scale",
    })

    const {name,email,password}=req.body
    const user= await User.create({
        name,
        email,
        password,
        avatar:{
            public_id : myCloud.public_id,
            url : myCloud.secure_url,
        }
    })

    sendToken(user,201,res);
 //also adding the token into the cookies in sendtoken 
    // const token=user.getJWTToken();
    // res.status(201).json({
    //     success:true,
    //     token
    // })
})

//Login User
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{

    const{email,password}=req.body;

    //checking if  user has given password and email both

    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email & Password"),400)
    }

    const user= await User.findOne({ email:email}).select("+password")

    if (!user) {
        return next(new ErrorHandler("Invalid email or password",401))
    }
    
    //Compare Password
    const isPasswordMatched=await bcrypt.compare(password,user.password)
    // const isPasswordMatched = user.comparePassword(password)

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password",401))
    }

    sendToken(user,200,res);
})

//Log Out User
exports.logout =catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly: true,
    })

    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
})

//Forgot Password
exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});

    if (!user) {
        return next(new ErrorHandler("user not found",404))
    }

    //Get ResetPassword Token
    const resetToken =user.getResetPasswordToken();
    await user.save({ validateBeforSave : false});

    const resetPasswordUrl= `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} 
    \n\n if you have not requested this email then please ignore it`;

    try {
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,
        })

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforSave : false});

        return next( new ErrorHandler(error.message,500))
    }
})



//Reset Password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{
    
    //creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt: Date.now() },
    })
    if (!user) {
        return next(new ErrorHandler("Reset Password Token is Invalid or has beed expired",400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't matched",400))
    }

    user.password= req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res);
})

//Get User Details
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        user
    })  
})

//Update User password
exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password")

       //Compare Password
       const isPasswordMatched=await bcrypt.compare(req.body.oldPassword,user.password)
       // const isPasswordMatched = user.comparePassword(password)
   
       if (!isPasswordMatched) {
           return next(new ErrorHandler("Old Password is incorrect",400))
       }

       if (req.body.newPassword !== req.body.confirmPassword) {
          return next(new ErrorHandler("Password does not match",400))
       }

       user.password=req.body.newPassword;
       await user.save();

    sendToken(user,200,res);
})

//Update User profile
exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }
    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);
    
        const imageId = user.avatar.public_id;
    
        await cloudinary.v2.uploader.destroy(imageId);
    
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
    
        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success: true,
    
    });
})

//get all users(admin)
exports.getAllUsers=catchAsyncErrors(async(req,res,next)=>{

    const users = await User.find();

    res.status(200).json({
        success:true,
        users,
    })
});

//get single user details(admin)
exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.params.id);

    if (!user) {
        return next( new ErrorHandler(`User does not exist with id :${req.params.id}`))
    }
    res.status(200).json({
        success : true,
        user,
    })
});

//Update User Role -(admin)
exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        success: true,
    
    });
})

//Delete user -(admin)
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{

    // we will remove cloudinary later
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`user does not exist with id :${req.params.id}`))
    }

     await user.remove()

    res.status(200).json({
        success: true,
        message:"User Deleted Succesfully",
    });
})