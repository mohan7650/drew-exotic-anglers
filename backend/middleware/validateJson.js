function validateJson(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid request body' });
  }
  next(err);
}

module.exports = validateJson;
