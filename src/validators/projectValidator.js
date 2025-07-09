import Joi from 'joi';

export const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Project name is required',
    'any.required': 'Project name is required',
  }),
  description: Joi.string().allow('').optional(),
});
