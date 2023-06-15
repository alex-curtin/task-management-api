const express = require('express');
const logger = require('morgan');
const cors = require('cors');

require('dotenv').config();

const db = require('./db');
const { authRoutes, projectRoutes, taskRoutes } = require('./routes');
const app = express();
const port = 6300;

app.use(logger('dev'));
app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  res.json({ message: 'hello world' });
});

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
