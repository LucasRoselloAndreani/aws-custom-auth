const Joi = require('joi');

const loginUserSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required()
});

module.exports = loginUserSchema;