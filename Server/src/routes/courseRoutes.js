import express from "express";
import { getAllCourses, createCourse, deleteCourse, updateCourse, getCoursesById } from "../controllers/courseControllers.js";

const router = express.Router();

router.route("/courses")
.get(getAllCourses)
.post(createCourse);

router.route("/courses/:id")
.get(getCoursesById)
.delete(deleteCourse)
.patch(updateCourse);

export default router;