import { Request, Response, NextFunction } from 'express';
import {
  snippets,
  content,
  words,
  sentences,
  songs,
  adhocSentences,
} from '../firebase/refs';

const eligibleRefs = [
  content,
  words,
  songs,
  sentences,
  snippets,
  adhocSentences,
];

const checkEligibleIsRef = (ref: string) => {
  if (!ref) {
    return false;
  }
  eligibleRefs.includes(ref);
};

const checkRefsEligibilityRoute = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  const { refs } = req.body;
  const refsCheckedBool = refs.every(checkEligibleIsRef);

  if (!refsCheckedBool) {
    const errorMsg = `Your refs are not valid. '${refs.join(
      ', ',
    )}' is not valid. Eligible refs: ${eligibleRefs.join(', ')}`;

    return res.status(400).json({
      error: errorMsg,
    });
  }
  next?.();
};

export { checkRefsEligibilityRoute };
