const db = require('../db');

exports.getProjectByName = async (req, res, next) => {
  const name = req.body.name || req.params?.name;
  if (!name) {
    return res.status(400).json({ errors: [{ message: 'Invalid request' }] });
  }
  const query = `
    SELECT * FROM projects
    LEFT JOIN users
    ON users.id = projects.owner
    WHERE project_name = $1
    `;
  const { rows } = await db.query(query, [name]);
  req.project = rows[0] || null;

  next();
};

exports.returnProject = async (req, res) => {
  if (!req.project) {
    return res.status(400).json({ message: 'Project not found' });
  }
  res.status(200).json(req.project);
};

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  const { id: userId } = req.user;

  if (req.project !== null) {
    return res
      .status(400)
      .json({ errors: [{ message: 'Project already exists' }] });
  }

  const query = `
    INSERT INTO projects(project_name, description, created_by, owner)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, description, userId, userId];
  const { rows } = await db.query(query, values);

  res.status(200).json(rows[0]);
};
