/* eslint-disable consistent-return */

export const errorHandler = (error, request, response, next) => {
	if (error.name === 'CastError' && error.kind === 'ObjectId') {
		return response.status(400).send({ success: false, message: 'malformatted id' });
	} if (error.name === 'ValidationError') {
		return response.status(400).send({ success: false, message: error.message });
	} if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
		return response.status(401).send({ success: false, message: 'Token expired or invalid. Sign in to continue' });
	}
	next(error);
};
