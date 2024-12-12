import { body } from 'express-validator';
import { checkMandatoryLanguage } from '../../route-validation/check-mandatory-language';

const sliceErrMsg =
  "Needs a sliceStart and end to tokenise content (can't tokenise all at the same time)";

export const tokeniseContentValidation = [
  checkMandatoryLanguage,
  body('sliceStart').notEmpty().isNumeric().withMessage(sliceErrMsg),
  body('sliceEnd').notEmpty().isNumeric().withMessage(sliceErrMsg),
];
