const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

const db = require("../db");

const getUserByUsernameQuery = "SELECT * FROM users WHERE username = $1";

const invalidCredentialsResponse = {
	errors: [{ message: "Invalid credentials" }],
};

exports.signupValidators = [
	body("username").notEmpty().isLength({ min: 4, max: 15 }),
	body("password").notEmpty().isLength({ min: 5, max: 15 }),
];

exports.signinValidators = [
	body("password").notEmpty().isLength({ min: 5, max: 15 }),
];

exports.validateSignup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	// check to see if user already exists
	const { username } = req.body;
	const { rows } = await db.query(getUserByUsernameQuery, [username]);
	if (rows.length) {
		return res
			.status(400)
			.json({ errors: [{ message: "User already exists" }] });
	}

	next();
};

exports.signup = async (req, res, next) => {
	const { username, password } = req.body;

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const query = `
    INSERT INTO users(username, password)
    VALUES($1, $2)
    RETURNING id, username;
    `;
	const values = [username, hashedPassword];
	const { rows } = await db.query(query, values);

	req.user = rows[0];

	next();
};

exports.validateSignin = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { username, password } = req.body;

	const userResponse = await db.query(getUserByUsernameQuery, [username]);
	const user = userResponse?.rows[0];
	if (!user) {
		return res.status(401).json(invalidCredentialsResponse);
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return res.status(401).json(invalidCredentialsResponse);
	}

	req.user = user;

	next();
};

exports.signin = async (req, res) => {
	const payload = {
		user: {
			id: req.user.id,
			username: req.user.username,
		},
	};

	jwt.sign(
		payload,
		process.env.JWT_SECRET,
		{ expiresIn: 360000 },
		(error, token) => {
			if (error) throw error;
			res.status(200).json({ token, user: req.user });
		},
	);
};

exports.checkAuth = async (req, res, next) => {
	const token = await req.header("x-auth-token");
	if (!token) {
		return res.status(401).json({ message: "No token, authorization denied" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded.user;

		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({ message: "Token is invalid" });
	}
};

exports.returnCurrentUser = async (req, res) => {
	res.status(200).json(req.user);
};
