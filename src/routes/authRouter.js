import express from 'express';

import {
	signup,
	resendVerification,
	verifyToken,
	login,
	logout
} from '../controllers';

const authRouter = express.Router();

// Register New User
authRouter.route('/signup').post(signup);

authRouter.route('/login').post(login);

authRouter.route('/verify/:token').get(verifyToken);

authRouter.route('/resend/verification').post(resendVerification);

authRouter.route('/logout').get(logout);

export default authRouter;
