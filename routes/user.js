const router = require("express").Router()
const User = require("../models/User")
const verifyToken = require("../requests/verifyToken")
const verifyTokenAndAdmin = require("../requests/verifyTokenAndAdmin")

//get all users
router.get('/', verifyToken, async (req, res) => {
	try {
		const users = await User.find()

		if(!users) {
			return res.status(404).json({msg: "Usuários não encontrados!"})
		}

		return res.status(200).json(users)
	} catch {
		res.status(400).json({msg: "Houve um erro ao carregar cursos!"})
	}
})

//get a user
router.get('/:id', verifyToken, async (req, res) => {
	try {
		const userId = req.params.id
		const user = await User.findById(userId, '-password')

		if(!user) {
			return res.status(404).json({msg: "Perfil não encontrado ou inexistente!"})
		}

		return res.status(200).json({user})
	} catch (e) {
		return res.status(402).json({msg: "Houve um erro ao carregar perfil!"})
	}
})


//edit a user
router.put('/edit/:id', verifyToken, async (req, res) => {
	const profileImg = req.body.profileImg
	const avatar = req.body.avatar
	const status = req.body.status

	const userId = req.params.id
	if (req.id !== userId) {
		return res.status(403).json({msg: "Você não tem autorização para isso!"})
		
	} else {
		try {
			const user = await User.findByIdAndUpdate(userId)
			user.avatar = req.body.avatar ? req.body.avatar : user.avatar
			user.status = req.body.status ? req.body.status : user.status
			user.profileImg = req.body.profileImg ? req.body.profileImg : user.profileImg
			user.save()
			return res.status(200).json({user, msg: "Perfil editado com sucesso!"})	
		} catch {
			return res.status(500).json({msg: "Houve um erro ao editar seu perfil!"})
		}
	}
})

//delete a user
router.delete('/delete/:userId', verifyTokenAndAdmin, async(req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findByIdAndRemove(userId)

		if(!user) {
			return res.status(404).json({msg: "Usuário não encontrado!"})
		}

		res.status(200).json({msg: "Usuário deletado com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao deletar usuário!"})
	}
})

//add permission to user
router.post('/permission/:userId', verifyTokenAndAdmin, async(req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findById(userId)

		if(!user) {
			return res.status(404).json({msg: "Usuário não encontrado!"})
		}

		user.admin = true
		user.save()

		res.status(200).json({msg: "Permissão concedida com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao conceder permissão!"})
	}
})

//delete permission to user
router.delete('/permission/:userId', verifyTokenAndAdmin, async(req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findById(userId)

		if(!user) {
			return res.status(404).json({msg: "Usuário não encontrado!"})
		}

		user.admin = false
		user.save()

		res.status(200).json({msg: "Permissão removida com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao remover permissão!"})
	}
})

module.exports = router