/* eslint-disable no-console */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes';
import { errorHandler, unknownEndpoint } from './middlewares';
import { NODE_ENV, COOKIE_SIGNATURE_SECRET } from './config/constants.js';
import './config/db';
// import { seedDb, seedUsers, dropSeed } from './config/seedDb';
const app = express();

app.set('trust proxy', true);

if (NODE_ENV === 'development') {
	// eslint-disable-next-line no-unused-vars
	// dropSeed().then(_seed => seedDb(seedUsers));
	app.use((req, res, next) => {
		console.log(req.method, '-', req.url);
		next();
	});
}

app.use(
	cors({
		credentials: true,
		origin: 'http://localhost:3000'
	})
);

app.use(cookieParser(COOKIE_SIGNATURE_SECRET));
app.use(express.json({ limit: '100kb' }));
app.disable('x-powered-by');
app.use('/', (req, res) => {
	res.json({ success: true, message: 'This is not a valid api call' });
});
app.use('/api/auth', authRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

export default app;
