import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const combineWordsValidation = [
  checkMandatoryLanguage,
  body('inputWords')
    .isArray({ min: 1 })
    .withMessage('inputWords must be a non-empty array'),
  body('inputWords.*.word')
    .isString()
    .withMessage('Each word must be a string')
    .notEmpty()
    .withMessage('Each word must not be empty'),
  body('inputWords.*.wordDefinition')
    .isString()
    .withMessage('Each wordDefinition must be a string')
    .notEmpty()
    .withMessage('Each wordDefinition must not be empty'),
  body('inputWords.*.context')
    .isString()
    .withMessage('Each context must be a string')
    .notEmpty()
    .withMessage('Each context must not be empty'),
];

export { combineWordsValidation };
