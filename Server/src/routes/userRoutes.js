import express from "express";
import { getAllUsers, createUserStudent, createUserAdmin, createUserTeacher, enrollInCourse } from "../controllers/userControllers.js";

const router = express.Router();

router.route("/user").get(getAllUsers);

router.route("/createUser/student").post(createUserStudent);
router.route("/createUser/admin").post(createUserAdmin);
router.route("/createUser/instructor").post(createUserTeacher);

router.route("/enrollInCourse").post(enrollInCourse);

export default router;
