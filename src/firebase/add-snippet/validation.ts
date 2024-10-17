import { body } from 'express-validator';
import { languageValidation } from '../../route-validation/check-mandatory-language';

const addSnippetValidation = [
  ...languageValidation,
  body('snippet').notEmpty().withMessage('Snippet data was not passed'),
];

export { addSnippetValidation };
