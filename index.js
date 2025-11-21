import { Server } from "socket.io";
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import AuthRoutes from './routers/user/authRouter.js'
import productRoutes from './routers/user/productRouter.js'
import userRoutes from './routers/user/userRouter.js'
import AdminRoutes from './routers/admin/adminRouter.js'
import express from 'express'

import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import { verifyToken } from './middleware/verifyToken.js'
import path from 'path'
import mongoose from "mongoose";
import socketConnection from "./socket/socket.js";

dotenv.config()

 
// try {
//     await client.connect();
//     console.log("✅ Connected to MongoDB");
//   } catch (error) {
//     console.error("❌ Connection error:", error);
//     process.exit(1);
//   }
  
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));
mongoose.connection.on("error", err => {

  console.log("err", err)

})
mongoose.connection.on("connected", (err, res) => {

  console.log("mongoose is connected")

})
  const app = express();
  const port = process.env.PORT;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173",
      "https://swapy-three.vercel.app"
    ],
    credentials: true
  }
});

socketConnection(io)
// const __dirname = dirname(fileURLToPath(import.meta.url));
// app.get('/webpage', (req, res) => {
//   res.sendFile(join(__dirname, 'index.html'));
// });

// io.on('connection', (socket)=>{
//    console.log('a user connected', socket.id);
//    socket.on('disconnect', () => {
//     console.log('user disconnected', socket.id);
//   });
//   socket.on('sendMessage', (response) => {
//     console.log('response: ' + response.message);

//     io.emit('getMessage', response);
    
//   });
// })
  
  app.use(
  cors({
    origin: [
      "http://localhost:5173",          // for local development
      "https://swapy-three.vercel.app", // for deployed frontend
    ],
    credentials: true, // allow cookies, authorization headers
  })
);

  app.use(express.json());
  app.use(cookieParser());

  
  app.use(AuthRoutes);
  app.use(productRoutes);
  //console.log(process.env.SECRET);
  
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use(verifyToken)
  
  
  app.use(userRoutes);
  app.use(AdminRoutes);
  
  
  
  server.listen(port, () => {
    console.log("Server running at http://localhost:3000");
  });
  