import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const updateSentenceKeys = {
  id: 'id',
  title: 'title',
  targetLang: 'targetLang',
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

export { breakdownSentenceValidation };
