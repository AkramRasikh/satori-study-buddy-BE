import { body } from 'express-validator';
import { languageValidation } from '../../route-validation/check-mandatory-language';

const deleteWordValidation = [
  ...languageValidation,
  body('id')
    .notEmpty()
    .isString()
    .withMessage('Validation error passing id to delete word'),
];

export { deleteWordValidation };
