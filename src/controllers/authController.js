/* eslint-disable max-len */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
// import passport from 'passport';
import nanoid from 'nanoid';
import User from '../models/user';
import { comparePassword } from '../helpers';
import { refreshToken, accessToken } from '../middlewares';
import {
	generateAvatar,
	hashPassword,
	confirmEmail,
	registerSchema
} from '../helpers';

// Register New User
export const signup = async (req, res, next) => {
	const { username, email, password } = req.body;
	const lowerUsername = username.toLowerCase();
	const lowerEmail = email.toLowerCase();
	const now = new Date();
	const validRegister = registerSchema.validate(req.body);
	if (validRegister.error) {
		return next(validRegister.error);
	}
	try {
		const emailOrUsernameExists = (await User.findOne({ email: validRegister.value.email }))
			|| (await User.findOne({ username: validRegister.value.username }));
		if (emailOrUsernameExists) {
			return res.status(400).send({
				success: false,
				message: 'Email or username already in use. Sign in instead?'
			});
		}
	} catch (exception) {
		next(exception);
	}

	const newUser = new User({
		email: lowerEmail,
		username: lowerUsername,
		password: await hashPassword(password),
		secretToken: nanoid(10),
		avatar: await generateAvatar(nanoid(10)),
		secretTokenExpiry: now.getTime() + 1000 * 60 * 60 * 24 // Set to 24 hours
	});

	try {
		await newUser.save();
		confirmEmail(email, username, newUser.secretToken);
		res.clearCookie('it-y');
		return res.status(201).json({
			success: true,
			message: 'Check your email to complete sign up'
		});
	} catch (exception) {
		next(exception);
	}
};

// Confirm newly registered Email
export const verifyToken = async (req, res, next) => {
	const { token } = req.params;
	const now = new Date();
	try {
		const user = await User.findOne({ secretToken: token });
		if (user) {
			if (now < user.secretTokenExpiry) {
				// secret token expires later than now
				user.secretToken = null;
				user.secretTokenExpiry = null;
				user.active = true;
				await user.save();
				const authToken = accessToken(user);
				const clientToken = refreshToken(user);
				res.cookie('it-y', clientToken, { signed: true, httpOnly: true });
				return res.status(200).json({
					success: true,
					username: user.username,
					email: user.email,
					accessToken: authToken,
					message: 'Welcome, your email is now verified',
					exp: Date.now() + 1000 * 60 * 15 // token expiration will occur in the next 15 minutes
				});
			}
			return res.status(400).send({
				success: false,
				message: 'Verification token has expired. Request another one'
			});
		}
		next();
	} catch (exception) {
		next(exception);
	}
};

// Request another verification token
export const resendVerification = async (req, res, next) => {
	const { emailOrUsername } = req.body;
	const now = new Date();
	try {
		const user = (await User.findOne({ email: emailOrUsername }))
			|| (await User.findOne({ username: emailOrUsername }));
		const newSecretToken = nanoid(10);
		const newSecretTokenExpiry = now.getTime() + 1000 * 60 * 60 * 24; // 1 day activation grace

		if (user && !user.secretToken && user.active) {
			// User exists, secretToken does not exists (has been verified)
			return res.status(200).json({
				success: true,
				message:
					'This account has already been verified, please continue to sign in'
			});
		}
		if (user && now > user.secretTokenExpiry && !user.active) {
			// User exists, token has expired, Account is unverified
			// const { email, username } = user;
			// confirmEmail(email, username, newSecretToken);
			user.secretToken = newSecretToken;
			user.secretTokenExpiry = newSecretTokenExpiry;
			await user.save();
		} else if (user && !(now > user.secretTokenExpiry) && !user.active) {
			// User exists, has not expired Account is unverified
			return res.status(400).send({
				success: false,
				message:
					'Your current verification token has not expired, Please click on the link in your email or contact support'
			});
		}
		// Send new token to user if username or email exist and display positive message in case it was a guess
		return res.status(200).json({
			success: true,
			message:
				'If the above credential is correct, you will receive a mail shortly'
		});
	} catch (exception) {
		next(exception);
	}
};

export const login = async (req, res, next) => {
	try {
		const { emailOrUsername, password } = req.body;
		const user = (await User.findOne({ email: emailOrUsername }))
			|| (await User.findOne({ username: emailOrUsername }));
		const passwordCorrect = user === null ? false : await comparePassword(password, user.password);

		if (!(user && passwordCorrect)) {
			return res.status(400).send({
				success: false,
				message: 'invalid username or password'
			});
		}
		const authToken = await accessToken(user);

		const clientToken = await refreshToken(user);
		res.cookie('it-y', clientToken, {
			signed: true,
			httpOnly: true,
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
		}); // 7 days
		return res.status(200).json({
			success: true,
			username: user.username,
			email: user.email,
			accessToken: authToken,
			exp: Date.now() + 1000 * 60 * 15 // Refresh token expires in the 15 minutes
		});
	} catch (exception) {
		next(exception);
	}
};

export const logout = async (req, res) => {
	res.clearCookie('it-y');
	return res.status(200).json({
		success: true,
		message: 'You have successfully signed out, see you again soon'
	});
};
