
// import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// const myDB = client.db("olxClone");
// const Users = myDB.collection("users");

import nodemailer from 'nodemailer'
import otpGenerator from "otp-generator";
import { User } from '../model/User.js';

export const register =async (req, res)=>{
        if(!req.body.firstName || !req.body.lastName || !req.body.phone || !req.body.password || !req.body.email){
            
              return res.status(400).send({
                  message:"please fill out complete form",
                status: 0
                })
        
          }
        else{
            const userEmail=req.body.email.toLowerCase();
    
            const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    
            const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    
    if(userEmail.match(emailFormat) && req.body.password.match(passwordValidation)){
    
        const checkUser = await User.findOne({email: userEmail})
    
        if(checkUser){
                            return res.status(409).send({
                  message:"Email already exist",
                status: 0
                })
        }
        else{
    
           const hashedPassword = await bcrypt.hashSync(req.body.password)
            const user={
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                city: req.body.city,
                password: hashedPassword,
                status:"active",
                isVerified: false,
                role:"user"
            }
            
            
            const response=  await User.create(user);
            if(response){
                return res.status(201).send({
                  message:"User registeration successfully",
                status: 1
                })
            }
            else{
                return res.status(500).send({
                  message:"Something went wrong",
                status: 0
                })
            }
        }
            }else{
                return res.status(400).send({
                  message:"invalid email or password",
                status: 0
                })
              }
        }
    
}

export const login = async (req, res)=>{


     if( !req.body.password || !req.body.email){
 return res.status(400).send({
        status : 0,
        message : "Email or Password is required"
      })
    }

        const email=req.body.email.toLowerCase()
        const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

        if(!email.match(emailFormat)){
      return res.status(400).send({
        status : 0,
        message : "Email is Invalid"
      })
    }
        const user = await User.findOne({email: email}).select("+password")
        // console.log(user);
        
        if(!user){
              return res.status(400).send({
        status : 0,
        message : "Email is not registered!"
      })
        }
   const matchPassword = await bcrypt.compareSync(req.body.password, user.password)
    if(!matchPassword){
      return res.status(401).send({
        status : 0,
        message : "Email or Password is incorrect"
      })
    }
    const token= await jwt.sign({
        _id: user._id,
        email,
        firstName:user.firstName,
    }, process.env.SECRET, {expiresIn: "24h"})
     res.cookie("token", token,{
      httpOnly:true,
      secure: true,
      sameSite: "none"
    })
return res.status(200).send({
    status : 1,
      message : "Login Successful",
      data : {
        id:user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city:user.city,
        role: user.role
      }
})

    
}

export const nodeMailer = async (req, res)=> {
  try {
    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
      auth: {
user: process.env.email, 
pass: process.env.password,
      },
    });

    const emailFormat = /^[a-zA-Z0-9_.+]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    let email = req.body.email?.toLowerCase();

    if (!email || !email.match(emailFormat)) {
      return res.status(400).json({
        status: 0,
        message: "Email is Incorrect",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        status: 0,
        message: "Email is not registered!",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // OTP expiration (5 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Save OTP to user
    await User.updateOne(
      { email: email },
      { $set: { otp: otp, expiresAt: expiresAt } }
    );

    // Email template
    const mailOptions = {
      from: 'Swapy <swapy@contact.com>',
      to: email,
      subject: 'Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #333;">OTP Verification</h2>
          <p>Hello ${user.firstName},</p>
            <a href="http://localhost:5173/resetpassword?email=${email}&&otp=${otp}">reset your password</a>
          <p>Your OTP for verification is: 
            <strong style="font-size: 24px; color: #ff6b6b;">${otp}</strong>
          </p>
          <p>This OTP will expire in 5 minutes.</p>
          <br>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    //console.log('Email sent: ' + info.response);
    res.json({
      status: 1,
      message: 'OTP generated and sent successfully',
      data: {email:email}, // ⚠️ remove in production
    });

  } catch (error) {
    console.error("Error Generating OTP: ", error);
    res.status(500).json({
      status: 0,
      message: "Internal Server Error",
    });
  }

    }

export const verifyOtp = async (req, res) => {
  try {
    const emailFormat = /^[a-zA-Z0-9_.+]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const otpFormat = /^\d{6}$/;

    let email = req.body.email?.toLowerCase();
    let otp = req.body.otp;

    if (!email?.match(emailFormat) || !otp?.match(otpFormat)) {
      return res.status(400).json({
        status: 0,
        message: "OTP or email format is invalid",
      });
    }

    const verify = await User.findOne({ email });

    if (!verify) {
      return res.status(404).json({
        status: 0,
        message: "User not found or OTP incorrect",
      });
    }

    // Check if OTP matches explicitly (optional since already used in query)
    if (verify.otp !== otp) {
      return res.status(400).json({
        status: 0,
        message: "Please enter the correct OTP",
      });
    }

    // Check expiry
    if (verify.expiresAt < Date.now()) {
      return res.status(400).json({
        status: 0,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // ✅ Success response
    return res.status(200).json({
      status: 1,
      message: "Verification successful",
      data: {
      email:  email,
       otp: otp,
      },
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      status: 0,
      message: error.message || "Internal server error",
    });
  }
};


export const resetPassword= async (req, res)=>{
        const emailFormat = /^[a-zA-Z0-9_.+]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      const otpFormat= /^\d{6}$/;         
  const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            const {email, otp, password}= req.body;

if(!email.match(emailFormat) || !password.match(passwordValidation) || !otp.match(otpFormat)){
  return res.status(404).send({
        status : 0,
        message : "Please Enter Strong Password"
      })
    }

    if(!email || !password || !otp){
      return res.status(404).send({
        status : 0,
        message : "Please Enter Password"
      })
    }

     const verify= await User.findOne({email:email, otp:otp});
     //console.log(verify);
     
if(!verify){
res.status(404).json({
      status: 0,
      message: "User not found",
    });
}
const hashedPassword = await bcrypt.hashSync(password)
// if (verify.expiresAt < Date.now()) {
//             return res.status(400).json({
//                 status: 0,
//                 message: "Link has expired. Please request again."
//             });
//         }
await User.updateOne(
      { email: email, otp:otp },
      { $set: { password:hashedPassword } }
    );

res.status(200).send({        
   status: 1,
 message: "Password updated successful"
})

}
  //         let decoded = jwt.verify(token, process.env.SECRET, (err, decoded)=>{
  //             if (err) {
  //   if (err.name === "TokenExpiredError") {
  //     //console.log("Token expired");
  //     return res.status(401).send({
  //       status:0,
  //       message:"Token expired"
  //     })
  //   } else {
  //     //console.log("Invalid token");
  //           return res.status(401).send({
  //       status:0,
  //       message:"Invalid token"
  //     })
  //   }
  // } else {
  //   //console.log("Valid token:", decoded);
  // }
  //         });
          
  //           if(decoded){
  //               res.clearCookie('token',{
  //                   httpOnly: true,
  //                   secure: true
  //               })
  //               return res.status(200).send({
  //               status: 1,
  //               message: "logout successfully"
  //           })
  //           }

export const authMe=async (req, res)=>{
   try{
        const token = req.cookies?.token
        if(!token){
            return res.status(401).send({
                status: 0,
                message : 'Unauthorized'
            })
        }else{


         jwt.verify(token, process.env.SECRET,async (err, decoded)=>{


              if (err) {

    if (err.name === "TokenExpiredError") {

      return res.status(401).send({
        status:0,
        message:"Token expired"
      })

    } else {

            return res.status(401).send({
        status:0,
        message:"Invalid token"
      })
    }
    
  } else {


      const checkUser = await User.findOne({ _id: new ObjectId(decoded._id)}, {projection:{password:0, isVerified:0, status:0,expiresAt:0, otp:0}});
    return res.status(200).send({
                status: 1,
                data : checkUser
            })
  }
          });
          
            
        }

    }catch(error){
        return res.status(500).send({
            status: 0,
            error: error,
            message: "Something Went Wrong"
        })
    }
}

export const logOut=(req, res)=>{
   try{
        const token = req.cookies?.token
        if(!token){
            return res.status(401).send({
                status: 0,
                message : 'Unauthorized'
            })
        }else{
            let decoded = jwt.verify(token, process.env.SECRET);
            if(decoded){
                res.clearCookie('token',{
                    httpOnly: true,
                    secure: true,
                    sameSite: "none"
                })
                return res.status(200).send({
                status: 1,
                message: "logout successfully"
            })
            }
        }
    }catch(error){
        return res.send({
            status: 0,
            error: error,
            message: "Something Went Wrong"
        })
    }
}