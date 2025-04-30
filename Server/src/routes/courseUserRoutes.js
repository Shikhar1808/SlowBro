import express from "express";
import { getCoursesByInstructorId, getEnrolledCoursesByUserId, enrollInCourse, userWriteReview, awardCertificate, answerQuiz, testQuizAnswer, quizAnswerWithoutProcedure } from "../controllers/CourseUserControllers.js";

const router = express.Router();

router.route("/instructor/:id").get(getCoursesByInstructorId);
router.route("/student/:id").get(getEnrolledCoursesByUserId);
router.route("/enroll").post(enrollInCourse);
router.route("/review").post(userWriteReview);
router.route("/awardCertificate").post(awardCertificate);

router.route("/quizzes/:id").post(answerQuiz);
router.route("/quizzes/test/:id").post(testQuizAnswer);
router.route("/quizzes/answer/:id").post(quizAnswerWithoutProcedure);


export default router;