/* eslint-disable max-len */
/* eslint-disable consistent-return */
import nanoid from 'nanoid';
import User from '../models/user';
import {
	resetPasswordEmail, resetPasswordSchema, hashPassword, passwordResetConfirmationEmail
} from '../helpers';
import { revokeRefreshTokensForUser } from '../middlewares/jwt';

// Request password Reset Using Verified Email Or Username
export const requestPasswordReset = async (req, res, next) => {
	const { emailOrUsername } = req.body;
	const resetToken = nanoid();
	const now = new Date();
	try {
		const user = await User.findOne({ email: emailOrUsername }) || await User.findOne({ username: emailOrUsername });
		if (user && user.active === true) {
			user.resetPasswordToken = resetToken;
			user.resetPasswordExpiry = now.getTime() + 1000 * 60 * 60; // Expires in 1hr
			await user.save();
			resetPasswordEmail(user.email, resetToken);
		}
		return res.status(200).json({ success: true, message: 'If you are currently registered, you will receive a mail from us shortly, if there is a problem, please contact support' });
	} catch (exception) {
		next(exception);
	}
};


// Reset password
export const resetPassword = async (req, res, next) => {
	const { resetPasswordToken } = req.params;
	const { password, confirmPassword } = req.body;
	const now = new Date();
	try {
		const user = await User.findOne({ resetPasswordToken });
		if (user && (user.resetPasswordExpiry > now)) { // resetToken expires in the future
			const validNewPassword = resetPasswordSchema.validate({ password, confirmPassword });
			if (validNewPassword.error) {
				return next(validNewPassword.error);
			}
			user.password = await hashPassword(password);
			user.resetPasswordExpiry = null;
			user.resetPasswordToken = null;
			revokeRefreshTokensForUser(user.id);
			passwordResetConfirmationEmail(user.email);
			await user.save();
			return res.status(200).json({ success: true, message: 'You have successfully changed your password, sign in to continue' });
		}
		return res.status(400).send({ success: false, message: 'Token expired, please try again or contact support' });
	} catch (exception) {
		next(exception);
	}
};
