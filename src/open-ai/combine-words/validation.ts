import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const combineWordsValidation = [
  checkMandatoryLanguage,
  body('inputWords')
    .isArray({ min: 1 })
    .withMessage('inputWords must be a non-empty array'),
  body('myCombinedSentence').isString().optional(),
  body('inputWords.*.id')
    .isString()
    .withMessage('Each id must be a string')
    .notEmpty()
    .withMessage('Each id must not be empty'),
  body('inputWords.*.word')
    .isString()
    .withMessage('Each word must be a string')
    .notEmpty()
    .withMessage('Each word must not be empty'),
  body('inputWords.*.definition')
    .isString()
    .withMessage('Each definition must be a string')
    .notEmpty()
    .withMessage('Each definition must not be empty'),
];

export { combineWordsValidation };
