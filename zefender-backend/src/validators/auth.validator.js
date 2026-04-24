const Joi = require("joi");

// Password rules — applies to admin registration
const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[A-Z]/, "uppercase letter")
  .pattern(/[a-z]/, "lowercase letter")
  .pattern(/[0-9]/, "number")
  .pattern(/[^A-Za-z0-9]/, "special character")
  .required()
  .messages({
    "string.min":          "Password must be at least 8 characters",
    "string.pattern.name": "Password must contain at least one {#name}",
    "any.required":        "Password is required",
  });

// Login — email can be anything valid, password just needs to exist
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email":  "Enter a valid email address",
    "any.required":  "Email is required",
  }),
  password: Joi.string().min(1).required().messages({
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("superadmin", "admin").required().messages({
    "any.only":    "Role must be superadmin or admin",
    "any.required":"Role is required",
  }),
});

// Register — stricter password rules
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Enter a valid email address",
    "any.required": "Email is required",
  }),
  password: passwordSchema,
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

module.exports = { validateLogin, validateRegister };
