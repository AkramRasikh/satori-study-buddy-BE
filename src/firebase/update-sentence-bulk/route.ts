import { Request, Response } from 'express';
import { updateSentenceBulkLogic } from './update-sentence-bulk-logic';
import { validationResult } from 'express-validator';

const updateSentenceBulk = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { language, title, fieldToUpdate, removeReview } = req.body;

  try {
    const data = await updateSentenceBulkLogic({
      title,
      language,
      fieldToUpdate,
      removeReview,
    });
    res.status(200).json({ content: data });
  } catch (error: any) {
    res
      .status(400)
      .json({ error: error?.message || 'Error updating sentence' });
  }
};

export { updateSentenceBulk };
