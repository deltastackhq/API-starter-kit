/* eslint-disable no-console */
// @ts-check
import { PORT } from './config/constants';
import socket from 'socket.io';
import app from './app';
import http from 'http';
import { initSocketEvents } from './routes/events';
const server = http.createServer(app);

const io = socket(server);
initSocketEvents(io);
io.listen(server);

server.listen(PORT, () => {
	console.log(`> Server running on port ${PORT}`);
});
