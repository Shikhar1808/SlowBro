import express from 'express';
import { addModuelsToCourse,getModulesByCourseId,addVideoToModule,addQuizToModule,addFileToModule,getModuleContent } from '../controllers/courseContentControllers.js';

const router = express.Router();

router.route('/courses/:courseId/modules')
    .post(addModuelsToCourse)
    .get(getModulesByCourseId);

router.route('/modules/:moduleId/videos')
    .post(addVideoToModule);

router.route('/modules/:moduleId/quizzes')
    .post(addQuizToModule);

router.route('/modules/:moduleId/files')
    .post(addFileToModule);

router.route('/modules/:moduleId')
    .get(getModuleContent);

export default router;