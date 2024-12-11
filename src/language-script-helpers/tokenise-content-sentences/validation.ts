import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

export const tokeniseContentValidation = [
  checkMandatoryLanguage,
  body('title')
    .notEmpty()
    .isString()
    .withMessage(`Validation error passing title for tokenising`),
];
