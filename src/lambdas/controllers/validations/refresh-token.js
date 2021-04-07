const Joi = require('joi');

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

module.exports = refreshTokenSchema;