import express from 'express'
import { client } from '../../dbConfig.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


import { login, nodeMailer, register, resetPassword, verifyOtp } from '../../controller/AuthController.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login)


router.post('/forgotpassword', nodeMailer)

router.post('/verifyotp', verifyOtp)

router.post('/resetpassword',resetPassword)

router.post('/sendemail', nodeMailer );


export default router;