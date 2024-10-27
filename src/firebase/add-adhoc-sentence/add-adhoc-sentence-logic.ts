import { v4 as uuidv4 } from 'uuid';
import chatGptTextAPI from '../../open-ai/chat-gpt';
import { db } from '../init';
import narakeetAudio from '../../narakeet';
import { getRefPath } from '../../utils/get-ref-path';
import { adhocSentences } from '../refs';

const chatgpt4 = 'gpt-4';
const checkHasSimilarity = (item, adhocSentence) => {
  if (item.baseLang === adhocSentence.baseLang) return true;
  // if (item.targetLang === adhocSentence.targetLang) return true;
};

const jsonReturnFormat = {
  targetLang: 'そうだな、じゃあレンタカーでも借りて、箱根にでも行こう.',
  baseLang: "I know, then let's rent a car and go to Hakone",
  notes: 'Add whatever notes here ',
};

// const adhocSentenceExample = {
//   targetLang: 'I was thinking of doing something like that',
//   context: '',
// };

const adhocPrompt = `
  I am studying Japanese. I want the sentence below to be translated in the most natural way to Japanese.
  I want it to be returned as a JSON object as such: ${jsonReturnFormat}.

  Return the Japanese in the "targetLang" and english in the "baseLang".
  The property ‘notes’ for each line that is there to explain any nuisance linguistic difference that may require explanation.
  The target sentence is below in the object "baseLang". I sometimes add a "context" property to help explain how I want things to be translated/idea to convey

`;

// adhocSentence (baseLang, context)
const addAdhocSentenceLogic = async ({
  adhocSentence,
  language,
  topic,
  tags,
  nextReview,
}) => {
  const openAIKey = process.env.OPENAI_API_KEY;
  const sentenceId = uuidv4(); // maybe create on frontend?

  try {
    const refPath = getRefPath({ language, ref: adhocSentences });
    // Fetch the existing array
    const snapshot = await db.ref(refPath).once('value');
    let newArray = snapshot.val() || [];

    // Check if the new item's ID already exists in the array
    const isDuplicate = newArray.some((item) =>
      checkHasSimilarity(item, adhocSentence),
    );
    if (isDuplicate) {
      console.log('## Item already exists in DB (addAdhocSentence)');
      return false;
    }

    const promptWithSentence = adhocPrompt + JSON.stringify(adhocSentence);

    const resultContent = await chatGptTextAPI({
      sentence: promptWithSentence,
      model: chatgpt4,
      openAIKey,
    });

    if (resultContent.targetLang) {
      try {
        const naraKeetRes = await narakeetAudio({
          id: sentenceId,
          sentence: resultContent.targetLang,
          language,
        });

        if (naraKeetRes) {
          const newAdhocSentence = {
            id: sentenceId,
            hasAudio: sentenceId,
            topic,
            tags,
            nextReview,
            ...resultContent,
          };
          newArray.push(newAdhocSentence);
          // Update the entire array
          const refPath = getRefPath({ language, ref: adhocSentences });

          await db.ref(refPath).set(newArray);
          return newAdhocSentence;
        } else {
          console.log('## translation created, but audio failed 1', {
            adhocSentence,
          });
          return false;
        }
      } catch (error) {
        console.log('## translation created, but audio failed 2', {
          adhocSentence,
        });
        return false;
      }
    } else {
      console.log(
        '## Error generating translation (addAdhocSentence) ',
        adhocSentence,
      );
    }
  } catch (error) {
    console.error('## Error updating database structure:', error);
    return error;
  }
};

export { addAdhocSentenceLogic };
