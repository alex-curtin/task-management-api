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

exports.getProjectById = async (req, res, next) => {
  const { projectId } = req.params;
  const query = `
    SELECT * FROM projects
    LEFT JOIN tasks
    ON tasks.project_id = project.id
    WHERE project.id = $1;
  `;
  const values = [projectId];
  const { rows } = await db.query(query, values);
  res.status(200).json(rows[0]);
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

exports.getAllProjects = async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  // todo: validate limit & offset
  const query = `
    SELECT * FROM projects
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2;
  `;
  const values = [limit, offset];
  const { rows } = await db.query(query, values);
  res.status(200).json(rows);
};

exports.getProjectsByUserId = async (req, res) => {
  const reqType = req.route.path.split('/')[1];
  let userRole;
  if (reqType === 'owner') {
    userRole = 'owner';
  } else if (reqType === 'createdBy') {
    userRole = 'created_by';
  } else {
    return res.status(400).json({ errors: [{ message: 'Invalid request' }] });
  }

  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  if (!userId) {
    return res.status(400).json({ errors: [{ message: 'Missing user id' }] });
  }

  const query = `
    SELECT * FROM projects
    WHERE ${userRole} = $1
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const values = [userId, limit, offset];
  const { rows } = await db.query(query, values);
  res.status(200).json(rows);
};

exports.searchProjectsByName = async (req, res) => {
  const { projectName, limit = 10, offset = 0 } = req.query;
  console.log(projectName);
  const query = `
    SELECT * FROM projects
    WHERE project_name LIKE '%' || $1 || '%'
    ORDER BY updated_at
    LIMIT $2 OFFSET $3;
  `;
  const values = [projectName, limit, offset];
  const { rows } = await db.query(query, values);
  res.status(200).json(rows);
};
