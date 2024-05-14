import { Request, Response } from 'express';
import getSatoriCardsInBulk from './bulk-cards';

const satoriRoutes = (app) => {
  app.post('/satori-cards-bulk', async (req: Request, res: Response) => {
    const { body } = req;
    const isDueAndAuto = body?.isDueAndAuto;
    const sessionToken = body?.sessionToken;
    try {
      const response = await getSatoriCardsInBulk({
        isDueAndAuto,
        sessionToken,
      });

      const data = await response.json();

      if (!data.success) {
        res.status(401).json({ message: data.message });
      }

      console.log('## /satori-cards-bulk success');
      res.status(200).json({
        message: 'Satori cards successfully retrieved',
        data: data.result,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  });
};

export { satoriRoutes };
