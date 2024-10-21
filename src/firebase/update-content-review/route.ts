import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import {} from '../update-and-create-review';
import { updateAndCreateReview } from './update-content-review-logic';

const updateContentReview = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { language, title, fieldToUpdate } = req.body;

  try {
    const fieldToUpdateRes = await updateAndCreateReview({
      title,
      fieldToUpdate,
      language,
    });
    if (fieldToUpdateRes) {
      res.status(200).json(fieldToUpdateRes);
    } else {
      res.status(400).json({ message: 'Not found' });
    }
  } catch (error) {
    res.status(400).json();
    console.log('## /update-review Err', { error });
  }
};

export { updateContentReview };
