import { body } from 'express-validator';
import { languageValidation } from '../../route-validation/check-mandatory-language';

const deleteSnippetValidation = [
  ...languageValidation,
  body('id')
    .notEmpty()
    .isString()
    .withMessage('Validation error passing id to delete snippet'),
];

export { deleteSnippetValidation };
