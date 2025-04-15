import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const updateSentenceKeys = {
  id: 'id',
  title: 'title',
  targetLang: 'targetLang',
  sentences: 'sentences',
};

const breakdownSentenceValidation = [
  checkMandatoryLanguage,
  body(updateSentenceKeys.id)
    .notEmpty()
    .isString()
    .withMessage(
      `Validation error passing ${updateSentenceKeys.id} for update sentence`,
    ),
  body(updateSentenceKeys.title)
    .notEmpty()
    .isString()
    .withMessage(
      `Validation error passing ${updateSentenceKeys.title} for update sentence`,
    ),
  body(updateSentenceKeys.targetLang)
    .notEmpty()
    .isString()
    .withMessage(
      `Validation error passing ${updateSentenceKeys.targetLang} for update sentence`,
    ),
];
const breakdownAllSentenceValidation = [
  checkMandatoryLanguage,
  body(updateSentenceKeys.title)
    .notEmpty()
    .isString()
    .withMessage(
      `Validation error passing ${updateSentenceKeys.title} for update sentence`,
    ),
  body(updateSentenceKeys.sentences) // Assume 'sentences' is now an array of objects
    .isArray()
    .withMessage('Input must be an array of sentences')
    .notEmpty()
    .withMessage('Sentence array cannot be empty'),
  body(`${updateSentenceKeys.sentences}.*.id`) // Validate 'id' in each object
    .notEmpty()
    .isString()
    .withMessage(`Validation error passing 'id' for update sentence`),
  body(`${updateSentenceKeys.sentences}.*.targetLang`) // Validate 'targetLang' in each object
    .notEmpty()
    .isString()
    .withMessage(`Validation error passing 'targetLang' for update sentence`),
];

export { breakdownSentenceValidation, breakdownAllSentenceValidation };
