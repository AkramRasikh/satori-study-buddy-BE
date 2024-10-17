import { Request, Response } from 'express';
import { getOnLoadDataLogic } from './get-on-load-data-logic';
import { validationResult } from 'express-validator';

const getOnLoadData = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { refs, language } = req.body;
  try {
    const data = await getOnLoadDataLogic({ refs, language });
    res.status(200).json(data);
  } catch (error) {
    res
      .status(400)
      .json({ error: error?.message || 'Error loading initial data' });
  }
};

export { getOnLoadData };
