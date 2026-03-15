const Joi = require("joi");

// Validates when admin creates or updates a playlist
const playlistCreateSchema = Joi.object({
  device_id: Joi.string().required().messages({
    "string.empty": "Device ID cannot be empty",
    "any.required": "Device ID is required",
  }),
  ads: Joi.array()
    .items(
      Joi.object({
        ad_id: Joi.string().uuid().required().messages({
          "any.required": "ad_id is required for each item",
          "string.guid": "ad_id must be a valid UUID",
        }),
        order_index: Joi.number().integer().min(1).required().messages({
          "any.required": "order_index is required for each item",
          "number.min": "order_index must be at least 1",
        }),
        priority: Joi.number().integer().min(0).default(0),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Playlist must have at least one ad",
      "any.required": "Ads array is required",
    }),
});

// Validates when admin sets priority order for ads
const priorityUpdateSchema = Joi.object({
  device_id: Joi.string().required().messages({
    "any.required": "Device ID is required",
  }),
  priority_ads: Joi.array()
    .items(
      Joi.object({
        ad_id: Joi.string().uuid().required(),
        priority: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "At least one priority ad is required",
    }),
});

const validatePlaylistCreate = (req, res, next) => {
  const { error } = playlistCreateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validatePriorityUpdate = (req, res, next) => {
  const { error } = priorityUpdateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validatePlaylistCreate, validatePriorityUpdate };
