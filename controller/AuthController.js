
import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const myDB = client.db("olxClone");
const Users = myDB.collection("users");

import nodemailer from 'nodemailer'
import otpGenerator from "otp-generator";

export const register =async (req, res)=>{
        if(!req.body.firstName || !req.body.lastName || !req.body.phone || !req.body.password || !req.body.email){
            res.send("please fill out complete form");
        }
        else{
            const userEmail=req.body.email.toLowerCase();
    
            const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    
            const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    
    if(userEmail.match(emailFormat) && req.body.password.match(passwordValidation)){
    
        const checkUser = await Users.findOne({email: userEmail})
    
        if(checkUser){
            return res.send("Email already exist");
        }
        else{
    
           const hashedPassword = await bcrypt.hashSync(req.body.password)
            const user={
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                password: hashedPassword,
                status:"active",
                isVerified: false
            }
            
            
            const response=  await Users.insertOne(user);
            if(response){
                return res.send("user added successfully")
            }
            else{
                return res.send("something went wrong")
            }
        }
            }else{
                return res.send("invalid email or password")
            }
        }
    
}

export const login = async (req, res)=>{
     if( !req.body.password || !req.body.email){
 return res.status().send({
        status : 0,
        message : "Email or Password is required"
      })
    }
    else{
        const email=req.body.email.toLowerCase()
        const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if(!email.match(emailFormat)){
      return res.send({
        status : 0,
        message : "Email is Invalid"
      })
    }
        const user = await Users.findOne({email: email})
        if(!user){
              return res.send({
        status : 0,
        message : "Email is not registered!"
      })
        }
   const matchPassword = await bcrypt.compareSync(req.body.password, user.password)
    if(!matchPassword){
      return res.send({
        status : 0,
        message : "Email or Password is incorrect"
      })
    }
    const token= await jwt.sign({
        _id: user._id,
        email,
        firstName:user.firstName,
    }, process.env.SECRET, {expiresIn: "1h"})
     res.cookie("token", token,{
      httpOnly:true,
      secure: true
    })
return res.send({
    status : 1,
      message : "Login Successful",
      token,
      data : user
})

    }
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
    const user = await Users.findOne({ email: email });
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
    const expiresAt = Date.now() + 5 * 60 * 1000;

    // Save OTP to user
    await Users.updateOne(
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

    console.log('Email sent: ' + info.response);
    res.json({
      status: 1,
      message: 'OTP generated and sent successfully',
      otp, // ⚠️ remove in production
    });

  } catch (error) {
    console.error("Error Generating OTP: ", error);
    res.status(500).json({
      status: 0,
      message: "Internal Server Error",
    });
  }

    }


export const verifyOtp=async(req, res)=>{

      const emailFormat = /^[a-zA-Z0-9_.+]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      const otpFormat= /^\d{6}$/;

    let email = req.body.email?.toLowerCase();
    let otp = req.body.otp;
console.log(otp);

if(!email.match(emailFormat) && !otp.match(otpFormat)){
 return res.send({
        status : 0,
        message : "otp is Invalid"
      })
}

 const verify= await Users.findOne({email:email, otp:otp});
if(!verify){
res.status(404).json({
      status: 0,
      message: "User not found",
    });
}
if(verify.otp !== otp){
res.status(404).json({
      status: 0,
      message: "Please enter correct otp",
    });
}

console.log( verify.expiresAt, Date.now());

if (verify.expiresAt < Date.now()) {
            return res.status(400).json({
                status: 0,
                message: "OTP has expired. Please request a new OTP."
            });
        }

res.status(200).send({        
   status: 1,
 message: "Verification successful"
})
}


export const resetPassword= async (req, res)=>{
        const emailFormat = /^[a-zA-Z0-9_.+]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      const otpFormat= /^\d{6}$/;         
  const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            const {email, otp, password}= req.body;

if(!email.match(emailFormat) && !password.match(passwordValidation) && !otp.match(otpFormat)){
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

     const verify= await Users.findOne({email:email, otp:otp});
if(!verify){
res.status(404).json({
      status: 0,
      message: "User not found",
    });
}
const hashedPassword = await bcrypt.hashSync(password)
if (verify.expiresAt < Date.now()) {
            return res.status(400).json({
                status: 0,
                message: "Link has expired. Please request again."
            });
        }
await Users.updateOne(
      { email: email, otp:otp },
      { $set: { password:hashedPassword } }
    );

res.status(200).send({        
   status: 1,
 message: "Password updated successful"
})

}