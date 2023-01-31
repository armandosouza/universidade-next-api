const router = require("express").Router()
const Course = require("../models/Course")
const User = require("../models/User")
const verifyToken = require("../requests/verifyToken")
const verifyTokenAndAdmin = require("../requests/verifyTokenAndAdmin")

//get all courses
router.get('/', verifyToken, async(req, res) => {
	try {
		const courses = await Course.find()
		
		if(!courses) {
			return res.status(404).json({msg: "Nenhum curso foi encontrado!"})
		} else {
			res.status(200).json(courses)
		}
	} catch {
		res.status(400).json({msg: "Houve um erro ao carregar os cursos!"})
	}
})

//get a course
router.get('/:id', verifyToken, async(req, res) => {
	try {
		const courseId = req.params.id
		const course = await Course.findById(courseId)

		if(!course) {
			return res.status(404).json({msg: "Curso não foi encontrado!"})
		}

		res.status(200).json(course)
	} catch {
		res.status(400).json({msg: "Erro ao carregar curso!"})
	}
})

//get all courses of a user
router.get('/user/:userId', verifyToken, async(req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findById(userId)
		if(!user) {
			return res.status(404).json({msg: "Usuário não foi encontrado!"})
		}

		const courses = await Course.find()
		const coursesEnrolled = []
		const coursesNotEnrolled = []
		courses.forEach((course) => {
			const userCourse = course.students.find((student) => student.email === user.email)
			if(userCourse) {
				coursesEnrolled.push(course)
			}
			else {
				coursesNotEnrolled.push(course)
			}
		})

		res.status(200).json({coursesEnrolled, coursesNotEnrolled})
	} catch {
		res.status(400).json({msg: "Houve um erro ao carregar cursos!"})
	}
})

//get all grades of a user
router.get('/grades/user/:userId', verifyToken, async(req, res) => {
	try {
		const userId = req.params.userId
		const user = await User.findById(userId)
		if(!user) {
			return res.status(404).json({msg: "Usuário não foi encontrado!"})
		}

		const courses = await Course.find()
		const grades = []

		courses.forEach((course) => {
			const studentGrades = course.students.find((student) => student.email === user.email)
			if(studentGrades) {
				grades.push(studentGrades.grades)
			}
		})

		res.status(200).json(grades)
	} catch {
		res.status(400).json({msg: "Houve um erro ao carregar notas!"})
	}
})

//enroll in a course
router.post('/enroll/:courseId/:userId', verifyToken, async(req, res) => {
	try {
		const courseId = req.params.courseId
		const userId = req.params.userId
		const user = await User.findById(userId)

		const course = await Course.findById(courseId)

		if(req.id !== userId) {
			return res.status(403).json({msg: "Você não tem permissão para isso!"})
		}

		if(!course) {
			return res.status(404).json({msg: "Curso inexistente!"})
		}

		const enrolled = course.students.find((student) => student.email === user.email)
		if(enrolled) {
			return res.status(401).json({msg: "Você já está matriculado nesse curso!"})
		}

		course.subjects.forEach((subject) => {
			subject.subjectStatus.push({
				email: user.email
			})
		})

		course.students.push({
			email: user.email
		})

		course.save()
		res.status(200).json({msg: "Matrícula feita com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao realizar a matrícula!"})
	}
})

//register a new course
router.post('/new', verifyTokenAndAdmin, async(req, res) => {
	try {
		const name = req.body.name
		const description = req.body.description
		const level = req.body.level
		const tag = req.body.tag
		const img = req.body.img

		const course = await Course.findOne({name})
		if(course) {
			return res.status(403).json({msg: "Curso já existente!"})
		}

		const newCourse = new Course({
			name: name,
			description: description,
			level: level,
			tag: tag,
			img: img
		})

		await newCourse.save()
		res.status(200).json({msg: "Curso registrado com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao cadastrar curso!"})
	}
})

//edit a course
router.put('/edit/:id', verifyTokenAndAdmin, async(req, res) => {
	const courseId = req.params.id
	const course = await Course.findById(courseId)
	
	//input validation
	if(req.body.name && req.body.name !== course.name) {
		course.name = req.body.name
	}
	if(req.body.description && req.body.description !== course.description) {
		course.description = req.body.description
	}
	if(req.body.level && req.body.level !== course.level) {
		course.level = req.body.level
	}
	if(req.body.tag && req.body.tag !== course.tag) {
		course.tag = req.body.tag
	}
	if(req.body.img && req.body.img !== course.img) {
		course.img = req.body.img
	}

	course.save()
	res.status(200).json({msg: "Curso editado com sucesso!"})
})

//remove a course
router.delete('/delete/:id', verifyTokenAndAdmin, async(req, res) => {
	try {
		const courseId = req.params.id
		const course = await Course.findByIdAndRemove(courseId)

		if(!course) {
			return res.status(404).json({msg: "Curso não foi encontrado!"})
		}

		res.status(200).json({msg: "Curso removido com sucesso!"})
	} catch {
		res.status(400).json({msg: "Houve um erro ao deletar o curso!"})
	}
})

//register a course as finished
router.post('/:courseId', verifyToken, async(req, res) => {
	try {
		const courseId = req.params.courseId
		const userId = req.body.userId

		const course = await Course.findById(courseId)
		const user = await User.findById(userId)

		const student = course.students.find((student) => student.email === user.email && !student.status)
		if(!student) {
			return res.status(404).json({msg: "Erro ao localizar usuário no curso!"})
		} else {
			student.status = true
			course.save()
			res.status(200).json({msg: "Curso concluído com sucesso!"})
		}
	} catch(e) {
		console.log(e)
		res.status(400).json({msg: "Erro ao concluir curso!"})
	}
})

module.exports = router