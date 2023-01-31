const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
	const authToken = req.headers['authorization']
	const token = authToken.split(' ')[1]

	if(!token) {
		return res.status(401).json({userAuth: {auth: false}, msg: "Você não está logado!"})
	}

	jwt.verify(token, process.env.SECRET, (err, decoded) => {
		if(err) {
			return res.status(500).json({userAuth: {auth: false, token: null}, msg: "Erro de autenticação!"})
		} else {
			req.id = decoded.id
			next()
		}
	})
}

module.exports = verifyToken