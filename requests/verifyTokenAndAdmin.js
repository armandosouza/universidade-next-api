const verifyToken = require('./verifyToken')
const User = require('../models/User')

const verifyTokenAndAdmin = (req, res, next) => {
	verifyToken(req, res, () => {
		User.findById(req.id, (err, user) => {
			if(user.admin) {
				next()
			} else {
				return res.status(403).json({msg: "Você não tem autorização para isso!"})
			}
		})
	})
}

module.exports = verifyTokenAndAdmin