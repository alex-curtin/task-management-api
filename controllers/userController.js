const db = require("../db");

exports.getAllUsers = async (req, res) => {
	const { limit = 50, offset = 0 } = req.query;
	const query = `
    SELECT id, username
    FROM users
    LIMIT $1 OFFSET $2;
  `;
	const values = [limit, offset];
	const { rows } = await db.query(query, values);
	res.status(200).json(rows);
};

exports.searchUsers = async (req, res) => {
	const { term, limit = 20, offset = 0 } = req.query;
	const query = `
    SELECT id, username
    FROM users
    WHERE username LIKE '%' || $1 || '%'
    LIMIT $2 OFFSET $3;
  `;
	const values = [term, limit, offset];
	const { rows } = await db.query(query, values);
	res.status(200).json(rows);
};
