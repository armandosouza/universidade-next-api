const router = require("express").Router()
const mongoose = require("mongoose")
const Course = require("../models/Course")
const verifyToken = require("../requests/verifyToken")
const verifyTokenAndAdmin = require("../requests/verifyTokenAndAdmin")

//get a question
router.get('/:courseId/:subjectId/:lessonId/:questionId', verifyTokenAndAdmin, async(req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId
		const lessonId = req.params.lessonId
		const questionId = req.params.questionId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não foi encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]
		const lessonIndex = subject.lessons.findIndex(({_id}) => _id == lessonId)
		const lesson = subject.lessons[lessonIndex]
		const questionIndex = lesson.questions.findIndex(({_id}) => _id == questionId)
		const question = lesson.questions[questionIndex]

		res.status(200).json(question)
	} catch {
		res.status(400).json({msg: "Houve um erro ao remover questão!"})
	}
})

//add question
router.post('/new', verifyTokenAndAdmin, async(req, res) => {
	try {
		const courseId = req.body.courseId
		const subjectId = req.body.subjectId
		const lessonId = req.body.lessonId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não foi encontrado!"})
		}
		if(!req.body.title) {
			return res.status(404).json({msg: "Título inválido para questão!"})
		}
		if(!req.body.options) {
			return res.status(404).json({msg: "Não foram encontradas as alternativas da questão!"})
		}
		if(!req.body.correctAnswer) {
			return res.status(404).json({msg: "Resposta correta não foi setada!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]
		const lessonIndex = subject.lessons.findIndex(({_id}) => _id == lessonId)
		const lesson = subject.lessons[lessonIndex]

		if(lesson.type === "lesson" || lesson.type === "research") {
			return res.status(403).json({msg: "Essa lição não disponibiliza questões!"})
		}

		lesson.questions.push({
			title: req.body.title
		})

		const numberQuestions = lesson.questions.length
		const correctAnswer = parseInt(req.body.correctAnswer)

		req.body.options.forEach((option, index) => {
			if(index === correctAnswer) {
				lesson.questions[numberQuestions - 1].options.push({
					option,
					correct: true
				})
			} else {
				lesson.questions[numberQuestions - 1].options.push({
					option
				})
			}
		})

		course.save()
		res.status(200).json({msg: `Questão adicionada com sucesso à aula ${lesson.title}`})

	} catch(e) {
		console.log(e)
		res.status(400).json({msg: "Houve um erro ao adicionar questão!"})
	}
})

//delete a question
router.delete('/delete/:courseId/:subjectId/:lessonId/:questionId', verifyTokenAndAdmin, async(req, res) => {
	try {
		const courseId = req.params.courseId
		const subjectId = req.params.subjectId
		const lessonId = req.params.lessonId
		const questionId = req.params.questionId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não foi encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]
		const lessonIndex = subject.lessons.findIndex(({_id}) => _id == lessonId)
		const lesson = subject.lessons[lessonIndex]
		const questionIndex = lesson.questions.findIndex(({_id}) => _id == questionId)

		lesson.questions.splice(questionIndex, 1)

		course.save()
		res.status(200).json({msg: `Questão removida com sucesso da aula ${lesson.title}!`})

	} catch {
		res.status(400).json({msg: "Houve um erro ao remover questão!"})
	}
})

//edit a question
router.put('/edit', verifyTokenAndAdmin, async(req, res) => {
	try {
		const courseId = req.body.courseId
		const subjectId = req.body.subjectId
		const lessonId = req.body.lessonId
		const questionId = req.body.questionId

		const course = await Course.findById(courseId)
		if(!course) {
			return res.status(404).json({msg: "Curso não foi encontrado!"})
		}

		const subjectIndex = course.subjects.findIndex(({_id}) => _id == subjectId)
		const subject = course.subjects[subjectIndex]
		const lessonIndex = subject.lessons.findIndex(({_id}) => _id == lessonId)
		const lesson = subject.lessons[lessonIndex]
		const questionIndex = lesson.questions.findIndex(({_id}) => _id == questionId)
		const question = lesson.questions[questionIndex]

		if(req.body.title && req.body.title !== question.title) {
			question.title = req.body.title
		}

		if(req.body.options) {
			if(req.body.options[0] && req.body.options[0] !== question.options[0].option) {
				question.options[0].option = req.body.options[0]
			}
			if(req.body.options[1] && req.body.options[1] !== question.options[1].option) {
				question.options[1].option = req.body.options[1]
			}
			if(req.body.options[2] && req.body.options[2] !== question.options[2].option) {
				question.options[2].option = req.body.options[2]
			}
			if(req.body.options[3] && req.body.options[3] !== question.options[3].option) {
				question.options[3].option = req.body.options[3]
			}
		}

		if(req.body.correctAnswer) {
			for(let i = 0; i < question.options.length; i++) {
				if(i === parseInt(req.body.correctAnswer)) {
					question.options[i].correct = true
				} else {
					question.options[i].correct = false
				}
			}
		}

		course.save()
		res.status(200).json({msg: `Questão editada com sucesso da aula ${lesson.title}!`})

	} catch(e) {
		console.log(e)
		res.status(400).json({msg: "Houve um erro ao editar questão!"})
	}
})

module.exports = router