const router = require('express').Router()
const Course = require('../models/Course')
const User = require('../models/User')
const verifyTokenAndAdmin = require('../requests/verifyTokenAndAdmin')
const verifyToken = require('../requests/verifyToken')

//get a subject
router.get('/:courseId/:subjectId', verifyToken, async (req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]
		res.status(200).json(subject)
	} catch(e) {
		res.status(400).json({msg: "Houve um erro ao carregar disciplina!"})
	}
})

//get all subjects of a course
router.get('/:id', verifyToken, async(req, res) => {
	try {
		const courseId = req.params.id

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		} else {
			res.status(200).json(course.subjects)
		}
	} catch {
		res.status(400).json({msg: "Erro ao carregar disciplinas do curso"})
	}
})

//get all subjects of a user
router.get('/user/:userId/subjects', verifyToken, async(req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findById(userId)
		if(!user) {
			return res.status(404).json({msg: "Usuário não encontrado!"})
		}

		const courses = await Course.find()
		const subjectsCurrent = []
		const subjectsStudied = []

		courses.forEach((course) => {
			const student = course.students.find((student) => student.email === user.email)
			if(student) {
				const subjectsCourse = course.subjects
				subjectsCourse.forEach(subject => {
					const subjectStatus = subject.subjectStatus.find((subject) => subject.status)
					if(subjectStatus) {
						subjectsStudied.push(subject)
					} else {
						subjectsCurrent.push(subject)
					}
				})
			}
		})

		res.status(200).json({subjectsCurrent, subjectsStudied})
	} catch {
		res.status(400).json({msg: "Houve um erro ao carregar disciplinas!"})
	}
})

//register a subject
router.post('/new', verifyTokenAndAdmin, async(req, res) => {
	try {
		const courseId = req.body.courseId
		const course = await Course.findById(courseId)

		if(!req.body.name) {
			return res.status(402).json({msg: "Nome de disciplina inválido!"})
		}
		if(!req.body.semester) {
			return res.status(402).json({msg: "Período da disciplina inválido!"})
		}
		if(!req.body.description) {
			return res.status(402).json({msg: "Descrição da disciplina inválida!"})
		}
		if(!req.body.img) {
			return res.status(402).json({msg: "Imagem da disciplina inválida"})
		}

		course.subjects.push({
			semester: req.body.semester,
			name: req.body.name,
			description: req.body.description,
			img: req.body.img
		})

		await course.save()
		return res.status(200).json({msg: `Disciplina adicionada ao curso ${course.name} com sucesso!`})
	} catch(e) {
		res.status(400).json({msg: "Erro ao registrar disciplina!"})
	}
})

//delete a subject
router.delete('/delete/:courseId/:subjectId', verifyTokenAndAdmin, async (req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		course.subjects.splice(subjectIndex, 1)
		course.save()
		res.status(200).json({msg: "Disciplina removida com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao remover a disciplina!"})
	}
})

//edit a subject
router.put('/edit/:courseId/:subjectId', verifyTokenAndAdmin, async(req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]

		if(req.body.name) {
			subject.name = req.body.name
		}
		if(req.body.semester && 1 <= req.body.semester <= 10) {
			subject.semester = req.body.semester
		}
		if(req.body.description) {
			subject.description = req.body.description
		}
		if(req.body.img) {
			subject.img = req.body.img
		}
		course.save()
		res.status(200).json({msg: "Disciplina editada com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao editar a disciplina!"})
	}
})

//register a subject as finished
router.post('/:courseId/:subjectId', verifyToken, async(req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId
		const userId = req.body.userId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}
		const user = await User.findById(userId)

		const subject = course.subjects.find(subject => subject._id == subjectId)
		const userSubject = subject.subjectStatus.find((status) => status.email === user.email)
		if(userSubject.status) {
			return res.status(401).json({msg: "Usuário já concluiu a disciplina!"})
		} else {
			userSubject.status = true
			course.save()
			return res.status(200).json({msg: "Disciplina concluída com sucesso!"})
		}
	} catch(e) {
		console.log(e)
		res.status(400).json({msg: "Houve um erro ao registrar a disciplina como concluída!"})
	}
})

module.exports = router