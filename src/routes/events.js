let ioServer;


export const emitNotification = data => {
	ioServer.emit('app:notification', data);
};

export const initSocketEvents = io => {
	ioServer = io;
	io.on('connection', socket => {
		console.log('A client has connected');
		
		socket.on('dashboard', data => {
			console.log(data);
		});
		socket.on('connected', () => {
			socket.emit('app:notification', { message: 'A client connected!' });
		});

		socket.on('app:notification', emitNotification);

		socket.on('disconnect', () => {
			console.log('A client disconnected');
		});
	});
};
