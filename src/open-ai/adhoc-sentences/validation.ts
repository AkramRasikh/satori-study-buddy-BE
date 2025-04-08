import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const adhocSentenceTTSValidation = [
  checkMandatoryLanguage,
  body('sentence').isString().notEmpty(),
  body('context').isString().optional(),
  body('includeVariations').isBoolean().optional(),
];
const adhocExpressionTTSValidation = [
  checkMandatoryLanguage,
  body('inquiry').isString().notEmpty(),
  body('context').isString().optional(),
  body('includeVariations').isBoolean().optional(),
];
const adhocGrammarTTSValidation = [
  checkMandatoryLanguage,
  body('baseSentence').isString().notEmpty(),
  body('context').isString().optional(),
  body('grammarSection').isString().optional(),
  body('includeVariations').isBoolean().optional(),
  body('isSubtleDiff').isBoolean().optional(),
];

const adhocMinimalPairingWordTTSValidation = [
  checkMandatoryLanguage,
  body('inputWord.id').isString().notEmpty(),
  body('inputWord.word').isString().notEmpty(),
  body('inputWord.definition').isString().optional(),
  body('isMeaning').isString().optional(),
  body('isVisual').isBoolean().optional(),
];

export {
  adhocExpressionTTSValidation,
  adhocSentenceTTSValidation,
  adhocGrammarTTSValidation,
  adhocMinimalPairingWordTTSValidation,
};
