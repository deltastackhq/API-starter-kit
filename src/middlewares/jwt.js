/* eslint-disable no-underscore-dangle */
import nanoid from 'nanoid';
import { sign, verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/constants';
import User from '../models/user';

export const decodedToken = token => verify(token, ACCESS_TOKEN_SECRET);

export const decodeRefreshToken = token => verify(token, REFRESH_TOKEN_SECRET);


// our Authorization proccess
export const isValidToken = (req, res, next) => {
	const token = req.get('authorization');
	// validates if  the authorization is set in request
	if (!token) return res.status(401).send({ success: false, message: 'Access denied token null' });
	try {
		const bearer = token.substring(7);
		const decoded = decodedToken(bearer);
		req.user = decoded.sub;
		next();
	} catch (e) {
		next(e);
		// res.status(400).send({ success: false, message: 'Token expired or invalid' });
	}
	return true;
};

// for forget password or hacked account case
export const revokeRefreshTokensForUser = async (req) => {
	const { userId } = req.body;
	const user = await User.findById(userId);
	const newToken = user.tokenVersion + 1;
	await User.findByIdAndUpdate(userId, { tokenVersion: newToken }, { new: true });
	return true;
};

export const accessToken = user => {
	return sign({
		jid: nanoid(10),
		sub: user._id
	}, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const refreshToken = user => {
	return sign({
		jid: nanoid,
		version: user.tokenVersion,
		sub: user._id
	}, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// create new refresh and access tokens
export const renewRefreshToken = async (req, res, next) => {
	let payload;
	const token = req.signedCookies['it-y'];
	if (!token) {
		return res.status(204).end(); // If no token exists, do nothing
	}

	try {
		payload = decodeRefreshToken(token);
		let user = await User.findById(payload.sub).populate('profile'); // Get the user with the decoded token

		// if user is no longer exist or token has been revoked, reject refresh token
		if (!user || user.tokenVersion !== payload.version) {
			res.clearCookie('it-y'); // invalidate current token
			return res.status(400).send({ success: false, message: 'Token is no longer valid, please sign in again' });
		}

		const authToken = await accessToken(user); // create new access token
		const clientToken = await refreshToken(user); // create new refresh token
		res.cookie('it-y', clientToken, {
			signed: true, httpOnly: true, expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))
		}); // 7 days
		return res.status(200).json({
			success: true,
			username: user.username,
			email: user.email,
			profile: user.profile,
			accessToken: authToken,
			exp: (Date.now() + (1000 * 60 * 15)) // Refresh token expires in the 15 minutes
		});
	} catch (exception) {
		return next(exception);
	}
};
