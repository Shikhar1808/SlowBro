import express from "express";
import { getCoursesByInstructorId, getEnrolledCoursesByUserId, enrollInCourse, userWriteReview, awardCertificate } from "../controllers/CourseUserControllers.js";

const router = express.Router();

router.route("/instructor/:id").get(getCoursesByInstructorId);
router.route("/student/:id").get(getEnrolledCoursesByUserId);
router.route("/enroll").post(enrollInCourse);
router.route("/review").post(userWriteReview);
router.route("/awardCertificate").post(awardCertificate);


export default router;