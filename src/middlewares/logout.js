export const logout = async (req, res) => {
	res.clearCookie('it-y');
	return res.status(200).json({
		success: true,
		message: 'You have successfully signed out, see you again soon'
	});
};
