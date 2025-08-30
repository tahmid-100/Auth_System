const Joi = require('joi');

const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(12)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
    password: Joi.string().required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

const validateChangePassword = (req, res, next) => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(12)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    newPassword: Joi.string()
      .min(12)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      })
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateChangePassword,
  validateResetPassword
};