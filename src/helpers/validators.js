import Joi from '@hapi/joi';

export const registerSchema = Joi.object({
	email: Joi.string().email().required(),
	username: Joi.string().min(3).max(15).required(),
	password: Joi.string().regex(/^[a-zA-Z0-9]{6,20}$/).required()
});

export const resetPasswordSchema = Joi.object({
	password: Joi.string().regex(/^[a-zA-Z0-9]{6,20}$/).required(),
	confirmPassword: Joi.ref('password')
});
