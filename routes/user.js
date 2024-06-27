import express from 'express';
const userRouter = express.Router();

import { userLogin, userLogout, userRegister } from '../controllers/userController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';

userRouter.post('/login', userLogin);
userRouter.post('/register', userRegister);
userRouter.get('/logout',isLoggedIn, userLogout);

export default userRouter;