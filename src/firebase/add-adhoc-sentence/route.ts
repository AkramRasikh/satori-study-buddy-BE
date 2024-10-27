import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { addAdhocSentenceLogic } from './add-adhoc-sentence-logic';

const addAdhocSentence = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const adhocSentence = req.body.adhocSentence;
  const nextReview = req.body.nextReview;
  const tags = req.body?.tags;
  const topic = req.body?.topic;
  const language = req.body?.language;

  try {
    const result = await addAdhocSentenceLogic({
      language,
      adhocSentence,
      tags,
      topic,
      nextReview,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add sentence' });
  }
};

export { addAdhocSentence };
