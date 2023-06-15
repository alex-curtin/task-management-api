const express = require('express');

const { catchErrors } = require('./helpers');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/create',
  catchErrors(authController.checkAuth),
  catchErrors(projectController.getProjectByName),
  catchErrors(projectController.createProject)
);

router.get(
  '/name/:name',
  catchErrors(projectController.getProjectByName),
  catchErrors(projectController.returnProject)
);

module.exports = router;
