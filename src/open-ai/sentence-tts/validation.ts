import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const sentenceTTSValidation = [
  checkMandatoryLanguage,
  body('id').isString().notEmpty(),
  body('sentence').isString().notEmpty(),
];

export { sentenceTTSValidation };
