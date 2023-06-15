const express = require('express');

const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');
const { catchErrors } = require('./helpers');

const router = express.Router();

router.post(
  '/new',
  catchErrors(authController.checkAuth),
  catchErrors(taskController.createTask),
  catchErrors(taskController.getTaskById)
);

router.get('/id/:taskId', catchErrors(taskController.getTaskById));

router.get(
  '/currentUser',
  catchErrors(authController.checkAuth),
  catchErrors(taskController.getCurrentUserTasks)
);

router.get(
  '/project/:projectId',
  catchErrors(taskController.getTasksByProjectId)
);

router.put(
  '/update/:taskId',
  catchErrors(authController.checkAuth),
  catchErrors(taskController.updateTask),
  catchErrors(taskController.getTaskById)
);

module.exports = router;
