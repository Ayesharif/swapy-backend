import AuthRoutes from './routers/user/authRouter.js'
import productRoutes from './routers/user/productRouter.js'
import userRoutes from './routers/user/userRouter.js'
import AdminRoutes from './routers/admin/adminRouter.js'
import express from 'express'
import {client} from './dbConfig.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import { verifyToken } from './middleware/verifyToken.js'
import path from 'path'

dotenv.config()

 
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
  
  app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
    
  }));
  app.use(express.json());
  app.use(cookieParser());
  app.use('/', (req, res)=>{
    return res.send( "✅ Api is working")
  })
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))
  app.use(AuthRoutes);
  app.use(productRoutes);
  console.log(process.env.SECRET);
  
  app.use(verifyToken)
  
  app.use(userRoutes);
  app.use(AdminRoutes);
  
  
  
  app.listen(port, () => {
    console.log("Server running at http://localhost:3000");
  });
  