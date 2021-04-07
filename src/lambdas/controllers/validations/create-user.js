const Joi = require('joi');

const createUserSchema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().required(),
    clientId: Joi.string().required(),
    isActive: Joi.boolean().required(),
    groupId: Joi.string().required()
});

module.exports = createUserSchema;