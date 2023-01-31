const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		minLength: 4
	},
	birth: {
		type: Date,
		required: true
	},
	avatar: {
		type: String,
		default: "http://cdn.onlinewebfonts.com/svg/img_569204.png"
	},
	achievements: {
		type: Array
	},
	admin: {
		type: Boolean,
		default: false
	},
	profileImg: {
		type: String,
		default: "https://i.imgur.com/CAgG1CB.png"
	},
	status: {
		type: String,
		default: "Estou estudando na Next University!"
	},
	grade: {
		type: Number
	}
})

module.exports = mongoose.model('users', UserSchema)