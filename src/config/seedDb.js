/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import User from '../models/user';
import nanoid from 'nanoid';
import { hashPassword } from '../helpers';
const now = new Date();

export const seedUsers = [
	{
		username: 'user1',
		email: 'user1@123.com',
		password: 123456
	},
	{
		username: 'user21',
		email: 'user21@123.com',
		password: 123456
	},
	{
		username: 'admin',
		email: 'admin@123.com',
		admin: true,
		password: 123456
	}
];

export const seedDb = async data => {
	try {
		console.log('adding test users to db...');
		for (let item of data) {
			const newUser = new User({
				...item,
				password: await hashPassword(`${item.password}`),
				secretToken: nanoid(),
				secretTokenExpiry: now.getTime() + 1000 * 60 * 60 * 24
			});
			await newUser.save();
		}
		console.log('Test users added to database');
	} catch (err) {
		console.log('error seeding DB', err.message);
	}
};

export const dropSeed = async () => {
	try {
		await User.deleteMany();
		console.log('DB collections dropped');
	} catch (err) {
		console.log('error dropping DB collections', err.message);
	}
};
