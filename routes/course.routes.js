import { Router } from "express";
import { addLectureToCourseById, createCourse, getAllCourses, getLecturesByCourseId, removeCourse, updateCourse } from "../controllers/course.controller.js";
import { authorizeSubscriber, authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from '../middlewares/multer.middleware.js'

const router = new Router()

router.route('/')
.get( getAllCourses)
.post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse
    )

router.route('/:id')
.get(isLoggedIn, authorizeSubscriber, getLecturesByCourseId)
.put(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    updateCourse
)
.delete(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    removeCourse
)
.post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('lecture'),
    addLectureToCourseById
)

export default router