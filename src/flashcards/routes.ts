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
      const contextData = [];
      const topicsForAudio = [];

      japaneseWordsRes.forEach((word) => {
        const contexts = word.contexts;
        contexts.forEach((singleContext) => {
          if (!contextIds.includes(singleContext)) {
            contextIds.push(singleContext);
          }
        });
      });

      japaneseContentTopicKeys.forEach((topic) => {
        const thisTopicArr = japaneseContentRes[topic];
        thisTopicArr.forEach((sentenceData) => {
          if (contextIds.includes(sentenceData.id)) {
            const contextDataObj = {
              topic,
              ...sentenceData,
            };
            contextData.push(contextDataObj);
            if (!topicsForAudio.includes(topic)) {
              topicsForAudio.push(topic);
            }
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
              isMusic: true,
              ...sentenceData,
            };
            contextData.push(contextDataObj);
            if (!topicsForAudio.includes(title)) {
              topicsForAudio.push(title);
            }
          }
        });
      });

      const wordToContextData = japaneseWordsRes.map((word) => {
        const contexts = word.contexts;

        const contextToData = contextData.filter((contextDataWidget) =>
          contexts.includes(contextDataWidget.id),
        );

        return {
          ...word,
          contextToData,
        };
      });

      res
        .send({
          wordToContextData,
          // topics: topicsForAudio,
          // flashCardData: contextData,
        })
        .status(200);
    } catch (error) {
      console.log('## error get-japanese-words', error);
    }
  });
};

export { flashcardRoutes };
