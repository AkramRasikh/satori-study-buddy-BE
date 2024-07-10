import { Request, Response } from 'express';
import { getJapaneseContent, getJapaneseSongs, getJapaneseWords } from '.';

const flashcardRoutes = async (app) => {
  app.get('/get-japanese-words', async (req: Request, res: Response) => {
    try {
      const japaneseWordsRes = await getJapaneseWords();
      const japaneseContentRes = await getJapaneseContent();
      const japaneseSongsRes = await getJapaneseSongs();
      const japaneseContentTopicKeys = Object.keys(japaneseContentRes);
      const contextIds = [];
      japaneseWordsRes.forEach((word) => {
        const contexts = word.contexts;
        contexts.forEach((singleContext) => {
          if (!contextIds.includes(singleContext)) {
            contextIds.push(singleContext);
          }
        });
      });

      const contextData = [];
      japaneseContentTopicKeys.forEach((topic) => {
        const thisTopicArr = japaneseContentRes[topic];
        thisTopicArr.forEach((sentenceData) => {
          if (contextIds.includes(sentenceData.id)) {
            const contextDataObj = {
              topic,
              ...sentenceData,
            };
            contextData.push(contextDataObj);
          }
        });
      });

      // until no more contextIds
      japaneseSongsRes.forEach((song) => {
        const lyrics = song.lyrics;
        const title = song.title;
        lyrics.forEach((sentenceData) => {
          if (contextIds.includes(sentenceData.id)) {
            const contextDataObj = {
              topic: title,
              ...sentenceData,
            };
            contextData.push(contextDataObj);
          }
        });
      });

      res.send(contextData).status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });
};

export { flashcardRoutes };
