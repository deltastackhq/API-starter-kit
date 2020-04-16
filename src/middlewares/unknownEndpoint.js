export const unknownEndpoint = (req, res) => {
	res.status(404).send({ success: false, message: 'unknown endpoint' });
};
