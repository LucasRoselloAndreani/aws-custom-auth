const Joi = require('joi');

const createGroupSchema = Joi.object({
    groupName: Joi.string().required(),
    permissions:  Joi.array().items(Joi.object().keys({
        resource: Joi.string().required(),
        methods: Joi.array().items(Joi.string()).required()
    }))
});

module.exports = createGroupSchema;