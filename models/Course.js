const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String,
		required: true
	},
	level: {
		type: String,
		required: true
	},
	tag: {
		type: String,
		default: "Curso"
	},
	img: {
		type: String,
		default: "https://assets-global.website-files.com/5e39e095596498a8b9624af1/5f18321b82797afe4defe702_101%20crashcourse.jpg"
	},
	subjects: [
		{
			subjectId: {
				type: mongoose.Types.ObjectId
			},
			semester: {
				type: Number
			},
			name: {
				type: String
			}, 
			description: {
				type: String
			},
			img: {
				type: String
			},
			subjectStatus: [
				{
					email: {
						type: String
					},
					status: {
						type: Boolean,
						default: false
					}
				}
			],
			lessons: [
				{
					lessonId: {
						type: mongoose.Types.ObjectId
					},
					title: {
						type: String
					},
					description: {
						type: String
					},
					type: {
						type: String,
						default: 'lesson'
					},
					image: {
						type: String
					},
					video: {
						type: String
					},
					answer: {
						type: String
					},
					lessonStatus: [
						{
							email: {
								type: String
							},
							status: {
								type: Boolean,
								default: false
							}
						}
					],
					questions: [
						{
							questionId: {
								type: mongoose.Types.ObjectId
							},
							title: {
								type: String
							},
							options: [
								{
									option: {
										type: String
									},
									correct: {
										type: Boolean,
										default: false
									}
								}
							]
						}
					],
					questionStatus: [
						{
							email: {
								type: String
							},
							correctAnswers: {
								type: Number,
								default: 0
							},
							status: {
								type: Boolean,
								default: false
							}
						}
					]
				}
			]
		}
	],
	students: [
		{
			email: {
				type: String
			},
			status: {
				type: Boolean,
				default: false
			},
			grades: [
				{
					subject: {
						type: String
					},
					semester: {
						type: Number
					},
					grade: {
						type: mongoose.Decimal128
					}
				}
			]
		}
	]
})

module.exports = mongoose.model('courses', CourseSchema)