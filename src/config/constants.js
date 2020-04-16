import 'dotenv/config';

export const {
	NODE_ENV,
	PORT,
	SALT,
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN_SECRET,
	COOKIE_SIGNATURE_SECRET,
	SITE_URL
} = process.env;

const variables = {
	db:
		process.env.NODE_ENV === 'test'
			? process.env.TEST_DATABASE
			: process.env.DATABASE
};
export const DATABASE = variables.db;
