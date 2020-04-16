/* eslint-disable no-console */
import mongoose from 'mongoose';
import { DATABASE } from './constants';

mongoose.connect(DATABASE, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
});

const dbSetup = () => {
	const db = mongoose.connection;
	db.on('connected', () => {
		if (process.env.NODE_ENV === 'test') {
			console.log(`Connection to DB successful - ${DATABASE}`);
		} else {
			console.log('Connection to database successful');
		}
	});
	db.on('error', error => {
		console.log('error connecting to db', error.message);
	});

	db.on('disconnected', () => {
		console.log(console.log('disconnected from DB'));
	});

	process.on('SIGINT', () => {
		db.close(() => {
			console.log('Disconnected fro DB due to application shut down');
			process.exit(0);
		});
	});
};

dbSetup();
