/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		email: { type: String, unique: true, required: true },
		username: { type: String, unique: true, required: true },
		password: { type: String },
		secretToken: { type: String },
		secretTokenExpiry: { type: Date },
		active: { type: Boolean, default: false },
		resetPasswordToken: { type: String },
		resetPasswordExpiry: { type: Date },
		deactivated: { type: Boolean, default: false },
		tokenVersion: { type: Number, default: 0 },
		admin: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

userSchema.set('toJSON', {
	transform: (document, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		delete returnedObject._id;
		delete returnedObject.__v;
		delete returnedObject.password;
	}
});

export default mongoose.model('User', userSchema);
