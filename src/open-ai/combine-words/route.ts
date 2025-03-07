import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { deepSeekChatAPI } from '../chat-gpt';
import { combineWordsPrompt } from './prompt';
import {
  addSentencesBulkToDb,
  updateWordContext,
} from '../../firebase/add-word-context/route';
import { getInitSentenceCard } from '../../../create-card';
import googleTextToSpeechAPI from '../google-text-to-speech';

const combineWords = async (req: Request, res: Response) => {
  const deepseekKey = process.env.DEEPSEEK_KEY;
  const inputWords = req.body.inputWords;
  const language = req.body.language;
  const sentencePrompt = combineWordsPrompt({
    words: inputWords,
    targetLanguage: language,
  });
  try {
    const resultContent = await deepSeekChatAPI({
      sentence: sentencePrompt,
      model: 'deepseek-chat',
      openAIKey: deepseekKey,
    });
    console.log('## resultContent', resultContent);
    const sentencesFromResult = resultContent.sentences;

    const sentencesWithIds = sentencesFromResult.map((sentence) => ({
      id: uuidv4(),
      topic: 'sentence-helper',
      hasAudio: true, // risky
      ...sentence,
      reviewData: getInitSentenceCard(),
    }));
    const sentencesToAddFromDB = await addSentencesBulkToDb({
      language,
      sentencesBulk: sentencesWithIds,
    });

    const sentencesWithTextToSpeech = await Promise.all(
      sentencesWithIds.map(async (item) => {
        const id = item.id;
        const text = item.targetLang;

        return await googleTextToSpeechAPI({
          id,
          text,
          language,
        });
      }),
    );

    console.log('## sentencesWithTextToSpeech', sentencesWithTextToSpeech);
    const wordsWithUpdatedContext = await Promise.all(
      sentencesToAddFromDB.map(async (sentence) => {
        const sentenceId = sentence.id;
        const matchedWordsId = sentence.matchedWordsId;

        return await Promise.all(
          matchedWordsId.map(async (matchedWordId) => {
            const result = await updateWordContext({
              wordId: matchedWordId,
              sentenceId,
              language,
            });

            return result;
          }),
        );
      }),
    );

    res.status(200).json([sentencesToAddFromDB, wordsWithUpdatedContext]);
  } catch (error) {
    console.log('## /combine-words error', error);
    res.status(500).json({ error });
  }
};

export { combineWords };

// const mockArr = {
//   sentences: [
//     {
//       id: 'd9bd2359-94c6-434a-ab0b-84c222dccafc',
//       baseLang:
//         "The secret society's headquarters had a hidden room for the 収容 of rogue time travelers.",
//       targetLang:
//         '秘密結社の本部には、反逆したタイムトラベラーの収容用の隠し部屋がありました。',
//       // matchedWordsSurface: [Array],
//       // matchedWordsId: [Array],
//       // reviewData: [Object],
//     },
//     {
//       id: '2761a8e0-21b5-45f1-83e2-aeff7b972f29',
//       baseLang:
//         'She decided to 直々 confront the ghost haunting her fridge, armed with nothing but a spatula.',
//       targetLang:
//         '彼女は、冷蔵庫を幽霊から守るために、直々にフライ返しを持って立ち向かうことにしました。',
//       // matchedWordsSurface: [Array],
//       // matchedWordsId: [Array],
//       // reviewData: [Object],
//     },
//     {
//       id: '9d67cc41-6526-4d30-8f59-baa37cf2d9fb',
//       baseLang:
//         "The zoo's new 収容 facility for mythical creatures was surprisingly spacious, but the dragons kept setting the fire alarms off.",
//       targetLang:
//         '動物園の新しい神話の生き物の収容施設は驚くほど広々としていましたが、ドラゴンが火災報知器を頻繁に鳴らしていました。',
//       // matchedWordsSurface: [Array],
//       // matchedWordsId: [Array],
//       // reviewData: [Object],
//     },
//     {
//       id: '7cef0a01-3ec5-45fb-b193-5423b10c3c2b',
//       baseLang:
//         "He felt it was only right to 直々 apologize to the sentient toaster for calling it 'just a kitchen appliance.'",
//       targetLang:
//         '彼は、知性を持ったトースターに「ただのキッチン用品」と呼んだことを直々に謝るのが当然だと思いました。',
//       // matchedWordsSurface: [Array],
//       // matchedWordsId: [Array],
//       // reviewData: [Object],
//     },
//   ],
// };

// const inputWordsArr = [
//   {
//     definition: 'From my point of view',
//     id: 'f641f167-e5e3-45db-a405-2cd74d739397',
//     word: '僕からみて',
//   },
//   {
//     definition: 'Or maybe',
//     id: '4f04a860-cef4-4e15-979d-8685c2d35da4',
//     word: 'だったりする',
//   },
// ];

// const response = [
//   [
//     {
//       id: 'c14aaa7b-f455-4b88-a632-2f8ff7274e0c',
//       baseLang:
//         "From my point of view, the moon is made of cheese, or maybe it's just a giant marshmallow.",
//       targetLang:
//         '僕からみて、月はチーズでできている、だったりする、巨大なマシュマロかもしれない。',
//       matchedWordsSurface: ['僕からみて', 'だったりする'],
//       matchedWordsId: [
//         'f641f167-e5e3-45db-a405-2cd74d739397',
//         '4f04a860-cef4-4e15-979d-8685c2d35da4',
//       ],
//       reviewData: {
//         due: '2025-03-06T16:55:54.953Z',
//         stability: 0.40255,
//         difficulty: 7.1949,
//         elapsed_days: 0,
//         scheduled_days: 0,
//         reps: 1,
//         lapses: 0,
//         state: 1,
//         last_review: '2025-03-06T16:54:54.953Z',
//         ease: 2.5,
//         interval: 0,
//       },
//     },
//     {
//       id: 'c5bc5d63-0065-4cd6-8abf-3d1af1bf1766',
//       baseLang:
//         "From my point of view, cats are secretly plotting world domination, or maybe they're just napping.",
//       targetLang:
//         '僕からみて、猫は密かに世界征服を企んでいる、だったりする、ただ昼寝をしているだけかもしれない。',
//       matchedWordsSurface: ['僕からみて', 'だったりする'],
//       matchedWordsId: [
//         'f641f167-e5e3-45db-a405-2cd74d739397',
//         '4f04a860-cef4-4e15-979d-8685c2d35da4',
//       ],
//       reviewData: {
//         due: '2025-03-06T16:55:54.953Z',
//         stability: 0.40255,
//         difficulty: 7.1949,
//         elapsed_days: 0,
//         scheduled_days: 0,
//         reps: 1,
//         lapses: 0,
//         state: 1,
//         last_review: '2025-03-06T16:54:54.953Z',
//         ease: 2.5,
//         interval: 0,
//       },
//     },
//     {
//       id: '2bfec880-f431-43af-88d0-78695c643429',
//       baseLang:
//         "From my point of view, pineapples belong on pizza, or maybe they're just a prank by the universe.",
//       targetLang:
//         '僕からみて、パイナップルはピザの上に乗るべきだ、だったりする、宇宙のいたずらかもしれない。',
//       matchedWordsSurface: ['僕からみて', 'だったりする'],
//       matchedWordsId: [
//         'f641f167-e5e3-45db-a405-2cd74d739397',
//         '4f04a860-cef4-4e15-979d-8685c2d35da4',
//       ],
//       reviewData: {
//         due: '2025-03-06T16:55:54.953Z',
//         stability: 0.40255,
//         difficulty: 7.1949,
//         elapsed_days: 0,
//         scheduled_days: 0,
//         reps: 1,
//         lapses: 0,
//         state: 1,
//         last_review: '2025-03-06T16:54:54.953Z',
//         ease: 2.5,
//         interval: 0,
//       },
//     },
//   ],
//   [
//     [
//       {
//         baseForm: '僕からみて',
//         contexts: [
//           'f3a45f11-6bfc-4a4f-ad27-58d86890aa8b',
//           'c14aaa7b-f455-4b88-a632-2f8ff7274e0c',
//         ],
//         definition: 'From my point of view',
//         id: 'f641f167-e5e3-45db-a405-2cd74d739397',
//         phonetic: 'ぼくからみて',
//         reviewData: {
//           difficulty: 7.1949,
//           due: '2025-03-04T15:39:38.049Z',
//           ease: 2.5,
//           elapsed_days: 0,
//           interval: 0,
//           lapses: 0,
//           last_review: '2025-03-04T15:38:38.049Z',
//           reps: 1,
//           scheduled_days: 0,
//           stability: 0.40255,
//           state: 1,
//         },
//         surfaceForm: '僕からみて',
//         transliteration: 'Boku kara mite',
//       },
//       {
//         baseForm: 'だったりする',
//         contexts: [
//           'd68288b1-9f3f-4942-81e9-eed8db7f39b3',
//           'c14aaa7b-f455-4b88-a632-2f8ff7274e0c',
//         ],
//         definition: 'Or maybe',
//         id: '4f04a860-cef4-4e15-979d-8685c2d35da4',
//         phonetic: 'だったりする',
//         reviewData: {
//           difficulty: 7.1949,
//           due: '2025-02-26T15:33:52.124Z',
//           ease: 2.5,
//           elapsed_days: 0,
//           interval: 0,
//           lapses: 0,
//           last_review: '2025-02-26T15:32:52.124Z',
//           reps: 1,
//           scheduled_days: 0,
//           stability: 0.40255,
//           state: 1,
//         },
//         surfaceForm: 'だったりする',
//         transliteration: 'Dattari suru',
//       },
//     ],
//     [
//       {
//         baseForm: '僕からみて',
//         contexts: [
//           'f3a45f11-6bfc-4a4f-ad27-58d86890aa8b',
//           'c5bc5d63-0065-4cd6-8abf-3d1af1bf1766',
//         ],
//         definition: 'From my point of view',
//         id: 'f641f167-e5e3-45db-a405-2cd74d739397',
//         phonetic: 'ぼくからみて',
//         reviewData: {
//           difficulty: 7.1949,
//           due: '2025-03-04T15:39:38.049Z',
//           ease: 2.5,
//           elapsed_days: 0,
//           interval: 0,
//           lapses: 0,
//           last_review: '2025-03-04T15:38:38.049Z',
//           reps: 1,
//           scheduled_days: 0,
//           stability: 0.40255,
//           state: 1,
//         },
//         surfaceForm: '僕からみて',
//         transliteration: 'Boku kara mite',
//       },
//       {
//         baseForm: 'だったりする',
//         contexts: [
//           'd68288b1-9f3f-4942-81e9-eed8db7f39b3',
//           'c5bc5d63-0065-4cd6-8abf-3d1af1bf1766',
//         ],
//         definition: 'Or maybe',
//         id: '4f04a860-cef4-4e15-979d-8685c2d35da4',
//         phonetic: 'だったりする',
//         reviewData: {
//           difficulty: 7.1949,
//           due: '2025-02-26T15:33:52.124Z',
//           ease: 2.5,
//           elapsed_days: 0,
//           interval: 0,
//           lapses: 0,
//           last_review: '2025-02-26T15:32:52.124Z',
//           reps: 1,
//           scheduled_days: 0,
//           stability: 0.40255,
//           state: 1,
//         },
//         surfaceForm: 'だったりする',
//         transliteration: 'Dattari suru',
//       },
//     ],
//     [
//       {
//         baseForm: '僕からみて',
//         contexts: [
//           'f3a45f11-6bfc-4a4f-ad27-58d86890aa8b',
//           '2bfec880-f431-43af-88d0-78695c643429',
//         ],
//         definition: 'From my point of view',
//         id: 'f641f167-e5e3-45db-a405-2cd74d739397',
//         phonetic: 'ぼくからみて',
//         reviewData: {
//           difficulty: 7.1949,
//           due: '2025-03-04T15:39:38.049Z',
//           ease: 2.5,
//           elapsed_days: 0,
//           interval: 0,
//           lapses: 0,
//           last_review: '2025-03-04T15:38:38.049Z',
//           reps: 1,
//           scheduled_days: 0,
//           stability: 0.40255,
//           state: 1,
//         },
//         surfaceForm: '僕からみて',
//         transliteration: 'Boku kara mite',
//       },
//       {
//         baseForm: 'だったりする',
//         contexts: [
//           'd68288b1-9f3f-4942-81e9-eed8db7f39b3',
//           '2bfec880-f431-43af-88d0-78695c643429',
//         ],
//         definition: 'Or maybe',
//         id: '4f04a860-cef4-4e15-979d-8685c2d35da4',
//         phonetic: 'だったりする',
//         reviewData: {
//           difficulty: 7.1949,
//           due: '2025-02-26T15:33:52.124Z',
//           ease: 2.5,
//           elapsed_days: 0,
//           interval: 0,
//           lapses: 0,
//           last_review: '2025-02-26T15:32:52.124Z',
//           reps: 1,
//           scheduled_days: 0,
//           stability: 0.40255,
//           state: 1,
//         },
//         surfaceForm: 'だったりする',
//         transliteration: 'Dattari suru',
//       },
//     ],
//   ],
// ];
