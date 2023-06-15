const catchErrors = fn => (req, res, next) => {
  return fn(req, res, next).catch(error => {
    console.error(error.message);
    res.status(500).send('Server error');
  });
};

module.exports = {
  catchErrors,
};
