const router = require("express").Router()
const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")
const verifyTokenAndAdmin = require("../requests/verifyTokenAndAdmin")
const verifyToken = require("../requests/verifyToken")

//get unique lesson
router.get('/:courseId/:subjectId/:lessonId', verifyToken, async (req, res) => {
	try{
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId
		const lessonId = req.params.lessonId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]
		const lesson = subject.lessons.find(({_id}) => _id == lessonId)

		res.status(200).json(lesson)
	} catch {
		res.status(400).json({msg: "Erro ao carregar aula!"})
	}
})

//get all lessons
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

		res.status(200).json(subject.lessons)
	} catch {
		res.status(400).json({msg: "Erro ao carregar aula!"})
	}
})

//register a new lesson
router.post('/new', verifyTokenAndAdmin, async (req, res) => {
	try{
		const courseId = req.body.courseId
		const subjectId = req.body.subjectId

		if(!req.body.title) {
			return res.status(402).json({msg: "Nome de aula inválido!"})
		}
		if(!req.body.description) {
			return res.status(402).json({msg: "Descrição da aula inválida!"})
		}
		if(!req.body.img) {
			return res.status(402).json({msg: "Imagem da aula inválida"})
		}

		const course = await Course.findById(courseId)

		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]

		subject.lessons.push({
			title: req.body.title,
			description: req.body.description,
			image: req.body.img,
			type: req.body.typeLesson
		})

		course.save()
		res.status(200).json({msg: `Aula cadastrada na disciplina ${subject.name} com sucesso!`})
	} catch(e) {
		console.log(e)
		res.status(400).json({msg: "Erro ao cadastrar aula!"})
	}
})

//delete a lesson
router.delete('/delete/:courseId/:subjectId/:lessonId', verifyTokenAndAdmin, async (req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId
		const lessonId = req.params.lessonId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const lessonIndex = course.subjects[subjectIndex].lessons.findIndex(({_id}) => _id == lessonId)

		const lessons = course.subjects[subjectIndex].lessons
		lessons.splice(lessonIndex, 1)

		course.save()
		res.status(200).json({msg: `Aula removida da disciplina ${course.subjects[subjectIndex].name} com sucesso!`})
	} catch {
		res.status(400).json({msg: "Erro ao deletar aula!"})
	}
})

//edit a lesson
router.put('/edit/:courseId/:subjectId/:lessonId', verifyTokenAndAdmin, async (req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId
		const lessonId = req.params.lessonId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const lessonIndex = course.subjects[subjectIndex].lessons.findIndex(({_id}) => lessonId)
		const lesson = course.subjects[subjectIndex].lessons[lessonIndex]
		
		if(req.body.title) {
			lesson.title = req.body.title
		}
		if(req.body.img) {
			lesson.image = req.body.img
		}
		if(req.body.description) {
			lesson.description = req.body.description
		}
		if(req.body.typeLesson) {
			lesson.type = req.body.typeLesson
		}

		course.save()
		res.status(200).json({msg: "Aula editada com sucesso!"})
	} catch {
		res.status(400).json({msg: "Erro ao editar aula!"})
	}
})

//register a lesson as finished
router.post('/:userId/:courseId/:subjectId/:lessonId', verifyToken, async(req, res) => {
	try {
		const userId = req.params.userId
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId
		const lessonId = req.params.lessonId

		const user = await User.findById(userId)
		if(!user) {
			return res.status(404).json({msg: "Usuário não encontrado!"})
		}

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const lessonIndex = course.subjects[subjectIndex].lessons.findIndex(({_id}) => _id == lessonId)
		const lesson = course.subjects[subjectIndex].lessons[lessonIndex]
		const student = course.students.find((student) => student.email === user.email)
		const studentGrades = student.grades.find((grade) => grade.subject === course.subjects[subjectIndex].name)

		if(!lesson.type === 'lesson' && !req.body.answer && !req.body.options) {
			return res.status(401).json({msg: "Resposta inválida ou questões não respondidas!"})
		}
		const lessonStatus = lesson.lessonStatus.find((status) => status.email === user.email)

		switch(lesson.type) {
			case 'lesson':
				if(!lessonStatus) {
					lesson.lessonStatus.push({
						email: user.email,
						status: true
					})
				}
				break
			case 'research':
				if(!lessonStatus) {
					lesson.lessonStatus.push({
						email: user.email,
						status: true
					})
					lesson.answer = req.body.answer
				}

				if(studentGrades) {
					student.grades.grade += 1
				} else {
					student.grades.push({
						subject: course.subjects[subjectIndex].name,
						semester: course.subjects[subjectIndex].semester,
						grade: 1
					})
				}
				break
			default:
				if(!lessonStatus) {
					lesson.lessonStatus.push({
						email: user.email,
						status: true
					})
				}

				req.body.options.forEach((option) => {
					const question = lesson.questions.find((question) => question._id == option.questionId)
					if(question.options[option.option].correct) {
						const statusUserLesson = lesson.questionStatus.findIndex((student) => student.email === user.email)
						if(statusUserLesson !== -1) {
							lesson.questionStatus[statusUserLesson].correctAnswers += 1
						} else {
							lesson.questionStatus.push({
								email: user.email,
								correctAnswers: 1,
								status: true
							})
						}
					}
				})


				const studentStatusLesson = lesson.questionStatus.findIndex((student) => student.email === user.email)
				const correctAnswers = lesson.questionStatus[studentStatusLesson].correctAnswers

				const gradeMax = lesson.type === 'task' ? 2 : 7
				const numberQuestions = lesson.questions.length
				const grade = correctAnswers * gradeMax / lesson.questions.length

				if(studentGrades) {
					student.grades.grade += grade
				} else {
					student.grades.push({
						subject: course.subjects[subjectIndex].name,
						semester: course.subjects[subjectIndex].semester,
						grade: grade
					})
				}
		}

		course.save()
		res.status(200).json({msg: `Você concluiu a aula ${lesson.title}!`})
	} catch {
		res.status(400).json({msg: "Houve um erro ao concluir a aula!"})
	}
})

module.exports = router