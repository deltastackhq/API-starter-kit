/* eslint-disable no-underscore-dangle */
// populate data in an Escrow
export const digModel = (model, obj) => {
	return model.find(obj).populate(['owner', 'invited', 'trustAgent', 'messages']);
};

export const generateAvatar = async seed => {
	let avatar = `https://avatars.dicebear.com/v2/identicon/${seed}.svg?options[padding]=0.4`;
	return avatar;
};
