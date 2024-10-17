import { languageValidation } from '../../route-validation/check-mandatory-language';

import { body } from 'express-validator';
import { eligibleRefs } from '../refs';

const getOnLoadDataValidation = [
  ...languageValidation,
  body('refs')
    .notEmpty()
    .isArray()
    .withMessage(`Refs are required: ${eligibleRefs.join(', ')}`)
    .custom((refs) => {
      const refsAreEligible = refs.every((ref: string) =>
        eligibleRefs.includes(ref),
      );
      if (refsAreEligible) {
        return true;
      }
      throw new Error(
        `Wrong refs passed. Available refs: ${eligibleRefs.join(', ')}`,
      );
    }),
];

export { getOnLoadDataValidation };
