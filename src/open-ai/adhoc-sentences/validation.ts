import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const adhocSentenceTTSValidation = [
  checkMandatoryLanguage,
  body('sentence').isString().notEmpty(),
  body('context').isString().optional(),
  body('includeVariations').isBoolean().optional(),
];

export { adhocSentenceTTSValidation };
