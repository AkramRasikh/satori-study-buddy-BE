import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { updateContentMetaDataLogic } from './update-content-review-logic';

const updateContentMetaData = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { language, title, fieldToUpdate } = req.body;

  try {
    const fieldToUpdateRes = await updateContentMetaDataLogic({
      title,
      fieldToUpdate,
      language,
    });
    res.status(200).json(fieldToUpdateRes);
  } catch (error) {
    res
      .status(400)
      .json({ message: error?.message || 'Error updating content' });
  }
};

export { updateContentMetaData };
