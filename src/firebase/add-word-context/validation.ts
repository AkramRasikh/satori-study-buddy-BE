import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const addWordContextValidation = [
  checkMandatoryLanguage,
  body('id').isString().notEmpty(),
  body('baseLang').isString().notEmpty(),
  body('targetLang').isString().notEmpty(),
  body('matchedWords').isArray({ min: 1 }),
  body('tokenised').isArray({ min: 1 }),
];

export { addWordContextValidation };
