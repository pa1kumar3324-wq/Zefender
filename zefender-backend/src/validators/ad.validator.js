const Joi = require("joi");

// Validates incoming request body when admin uploads an ad
const adUploadSchema = Joi.object({
  title: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Title cannot be empty",
    "any.required": "Title is required",
  }),
});

const validateAdUpload = (req, res, next) => {
  const { error } = adUploadSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateAdUpload };
