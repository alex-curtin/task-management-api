const db = require('../db');

exports.createTask = async (req, res, next) => {
  const { id: userId } = req.user;
  const { taskName, description, projectId, assignee } = req.body;
  const query = `
    INSERT into tasks(task_name, description, project_id, created_by, assignee)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [taskName, description, projectId, userId, assignee];
  const { rows } = await db.query(query, values);

  req.params.taskId = rows[0].id;

  next();
};

exports.getTaskById = async (req, res) => {
  const { taskId } = req.params;
  const query = `
    SELECT t.task_name, t.description, t.status, t.priority,
      p.id AS project_id, p.project_name,
      u1.id AS created_by_id, u1.username AS created_by_username,
      u2.id AS assignee_id, u2.username AS assignee_username
    FROM tasks AS t
    LEFT JOIN projects AS p ON p.id = t.project_id
    LEFT JOIN users AS u1 ON u1.id = t.created_by
    LEFT JOIN users AS u2 ON u2.id = t.assignee
    WHERE t.id = $1
  `;
  const values = [taskId];
  const { rows } = await db.query(query, values);
  const {
    created_by_id,
    created_by_username,
    assignee_id,
    assignee_username,
    ...rest
  } = rows[0];
  const formattedTask = {
    ...rest,
    created_by: {
      id: created_by_id,
      username: created_by_username,
    },
    assignee: {
      id: assignee_id,
      username: assignee_username,
    },
  };

  res.status(200).json(formattedTask);
};

exports.getCurrentUserTasks = async (req, res) => {
  const { id: userId } = req.user;
  const query = `
    SELECT t.id, t.task_name, t.description, t.status, t.priority,
      p.project_name
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.assignee = $1
    ORDER BY t.updated_at DESC;
  `;
  const values = [userId];
  const { rows } = await db.query(query, values);
  res.status(400).json(rows);
};
