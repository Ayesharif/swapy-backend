import AuthRoutes from './routers/user/authRouter.js'
import productRoutes from './routers/user/productRouter.js'
import userRoutes from './routers/user/userRouter.js'
import express from 'express'
import {client} from './dbConfig.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
dotenv.config()
import otpGenerator from "otp-generator";

try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Connection error:", error);
    process.exit(1);
  }
  
  const app = express();
  const port = process.env.PORT ||3000
  const expiresAt = Date.now() + 5 * 60 * 1000;
  console.log(expiresAt);
  
  
  app.use(express.json());
  app.use(cookieParser());
  
  app.use(AuthRoutes);
  app.use(productRoutes);
console.log(process.env.SECRET);

app.use((req, res, next)=>{
  try{
    const token = req.cookies.token;
    
    console.log("token .......",token);
    if(!token){
      return res.status(404).send({
      status: 0,
      error: error,
      message: "Token not found"
    })
    
  }
  const decode= jwt.verify(token, process.env.SECRET)
  console.log(decode);
  
    next()
    
  }
  catch(error){
    return res.send({
      status: 0,
      error: error,
      message: "Invalid Token"
    })
  }
})

app.use(userRoutes);



app.listen(port, () => {
    console.log("Server running at http://localhost:3000");
});
