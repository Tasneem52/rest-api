// load modules
const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
const db = require('../models');
const Course = db.Course;
const User = db.User;

// Import authenticateUser function from the middleware folder.
const authenticateUser = require('../middleware/authenticateUser.js');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// GET /api/users route: Returns a list of courses (including the user that owns each course)
router.get('/courses', async (req, res, next) => {
  const courses = await Course.findAll({
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    },
    include: [
      {
        model: User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });
  res.status(200).json(courses);
});

// GET /api/courses/:id route - Returns a course
router.get('/courses/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id,
    {
      attributes: {
        exclude: ['createdAt', 'updatedAt']
    },
    include: [
      {
        model: User,
        as: 'User',
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });
  if (course != null) {
    res.status(200).json(course);
  } else {
    res.status(404).json({message: "This course does not exist"});
  }
});

// POST /api/courses route - Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', authenticateUser, async (req, res, next) => {
  const user = req.currentUser;
  try {
    req.body.userId = user.dataValues.id;
    const course = await Course.create(req.body);
    const courseId = course.dataValues.id;
    res.status(201).set('Location', `/courses/${courseId}`).end()
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errorMessages = error.errors.map(error => error.message);
      res.status(400).json({ errors: errorMessages });
    } else {
      return next(error);
    }
  }
});

// PUT /api/courses/:id route - Updates a course and returns no content
router.put('/courses/:id', authenticateUser, async (req, res) => {
  const user = req.currentUser;
  try {
    const course = await Course.findByPk(req.params.id);
    if (course) {
      if (course.userId === user.dataValues.id) {
        if (req.body.title && req.body.description) {
          req.body.userId = user.dataValues.id;
          await course.update(req.body);
          res.status(204).end();
        } else {
          res.status(400).json({ message: "Please provide title and description"});
        }
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errorMessages = error.errors.map(error => error.message);
      res.status(400).json({ errors: errorMessages });
    } else {
      throw error;
    }
  }
  });

// DELETE /api/courses/:id route - Deletes a course and returns no content
router.delete('/courses/:id', authenticateUser, async (req, res) => {
  const user = req.currentUser;
  const course = await Course.findByPk(req.params.id);
  if (course) {
    if (course.userId === user.dataValues.id) {
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({ message: "Access denied"});
    }
  } else {
    res.sendStatus(404);
  }
  });

module.exports = router;
