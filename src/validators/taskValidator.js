import Joi from 'joi';

export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
  }),
  description: Joi.string().allow('').optional(),
  dueDate: Joi.date().iso().optional().messages({
    'date.format': 'Due date must be a valid ISO date',
  }),
});
