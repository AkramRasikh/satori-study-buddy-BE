import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const fieldToUpdatePrefix = 'fieldToUpdate';

const updateSentenceKeys = {
  id: 'id',
  title: 'title',
  withAudio: 'withAudio',
  voice: 'voice',
  targetLang: `${fieldToUpdatePrefix}.targetLang`,
  time: `${fieldToUpdatePrefix}.time`,
};

const updateSentenceValidation = [
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
  body(updateSentenceKeys.withAudio)
    .optional()
    .isBoolean()
    .withMessage(
      `Validation error passing ${updateSentenceKeys.withAudio} for update sentence. Should be a boolean`,
    ),
  body(updateSentenceKeys.voice)
    .notEmpty()
    .isString()
    .withMessage(
      `Validation error passing ${updateSentenceKeys.voice} for update sentence. Should be string. Check narakeet voices available`,
    ),
  body(updateSentenceKeys.time)
    .optional()
    .isNumeric()
    .withMessage(
      `Validation error passing ${updateSentenceKeys.time} for update sentence. Should be a number`,
    ),
];

export { updateSentenceValidation };
