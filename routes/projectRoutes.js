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

router.get('/all', catchErrors(projectController.getAllProjects));

router.get(
  '/owner/:userId',
  catchErrors(projectController.getProjectsByUserId)
);

router.get(
  '/createdBy/:userId',
  catchErrors(projectController.getProjectsByUserId)
);

router.get('/search', catchErrors(projectController.searchProjectsByName));

module.exports = router;
