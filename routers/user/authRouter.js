import express from 'express'
import { client } from '../../dbConfig.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


import { login, nodeMailer, register, verifyOtp } from '../../controller/AuthController.js';

const router = express.Router();
const myDB = client.db("olxClone");
const Users = myDB.collection("users");

router.post('/register', register);

router.post('/login', login)


router.post('/forgotpassword', nodeMailer)

router.post('verifyotp', verifyOtp)
router.post('/resetpassword',(req, res)=>{

})

router.post('/sendemail', nodeMailer );


export default router;