import { getFirebaseContent } from '../firebase/init';
import {
  japaneseContent,
  japaneseSongs,
  japaneseWords,
} from '../firebase/refs';

const getJapaneseWords = async () => {
  const data = await getFirebaseContent({ ref: japaneseWords });
  return data;
};
const getJapaneseContent = async () => {
  const data = await getFirebaseContent({ ref: japaneseContent });
  return data;
};
const getJapaneseSongs = async () => {
  const data = await getFirebaseContent({ ref: japaneseSongs });
  return data;
};

const getJapaneseWordsViaTopic = async ({ topic }) => {
  const japaneseWordsRes = await getJapaneseWords();
  const japaneseContentRes = await getJapaneseContent();

  const contextIds = [];
  const contextData = [];

  japaneseWordsRes.forEach((word) => {
    const contexts = word.contexts;
    contexts.forEach((singleContext) => {
      if (!contextIds.includes(singleContext)) {
        contextIds.push(singleContext);
      }
    });
  });

  const prefixName = topic.split('-')[0];

  const topicKeys = Object.keys(japaneseContentRes).filter(
    (thisTopic) => thisTopic.split('-')[0] === prefixName,
  );

  topicKeys.forEach((thisTopicKey) => {
    const thisTopicArr = japaneseContentRes[thisTopicKey];
    thisTopicArr.forEach((sentenceData) => {
      if (contextIds.includes(sentenceData.id)) {
        const contextDataObj = {
          topic: thisTopicKey,
          ...sentenceData,
        };
        contextData.push(contextDataObj);
      }
    });
  });
  const lastMap = [];
  japaneseWordsRes.forEach((word) => {
    const contexts = word.contexts;

    const contextToData = contextData.filter((contextDataWidget) =>
      contexts.includes(contextDataWidget.id),
    );
    if (contextToData?.length > 0) {
      lastMap.push({
        ...word,
        contextToData,
      });
    }
  });

  return lastMap;
};

const getJapaneseWordsViaSong = async ({ topic }) => {
  const japaneseWordsRes = await getJapaneseWords();
  const japaneseSongsRes = await getJapaneseSongs();
  const [thisSong] = japaneseSongsRes.filter((song) => song.title === topic);

  const contextIds = [];
  const contextData = [];

  japaneseWordsRes.forEach((word) => {
    const contexts = word.contexts;
    contexts.forEach((singleContext) => {
      if (!contextIds.includes(singleContext)) {
        contextIds.push(singleContext);
      }
    });
  });

  const lyrics = thisSong.lyrics;
  const title = thisSong.title;
  lyrics.forEach((sentenceData) => {
    if (contextIds.includes(sentenceData.id)) {
      const contextDataObj = {
        topic: title,
        isMusic: true,
        ...sentenceData,
      };
      contextData.push(contextDataObj);
    }
  });

  const lastMap = [];
  japaneseWordsRes.forEach((word) => {
    const contexts = word.contexts;

    const contextToData = contextData.filter((contextDataWidget) =>
      contexts.includes(contextDataWidget.id),
    );
    if (contextToData?.length > 0) {
      lastMap.push({
        ...word,
        contextToData,
      });
    }
  });

  return lastMap;
};

const countOccurrences = (arr) => {
  let counts = {};

  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (counts[item]) {
      counts[item]++;
    } else {
      counts[item] = 1;
    }
  }

  return counts;
};

const getTopicsWithFlashWordsToStudy = async () => {
  const japaneseWordsRes = await getJapaneseWords();
  const japaneseContentRes = Object.values(await getJapaneseContent()) as any;
  const japaneseContentNoNulls = japaneseContentRes?.filter(
    (item) => item !== null,
  );
  const japaneseSongsRes = await getJapaneseSongs();

  const contextIds = [];

  const topicsForAudio = [];

  japaneseWordsRes.forEach((word) => {
    const contexts = word.contexts;
    contexts.forEach((singleContext) => {
      contextIds.push(singleContext);
    });
  });

  japaneseContentNoNulls.forEach((topic) => {
    topic.content.forEach((sentenceData) => {
      contextIds.forEach((contextId) => {
        if (contextId === sentenceData.id) {
          topicsForAudio.push(topic.title);
        }
      });
    });
  });

  // until no more contextIds
  japaneseSongsRes.forEach((song) => {
    const lyrics = song.lyrics;
    const title = song.title;
    lyrics.forEach((sentenceData) => {
      contextIds.forEach((contextId) => {
        if (contextId === sentenceData.id) {
          topicsForAudio.push(title);
        }
      });
    });
  });

  return countOccurrences(topicsForAudio);
};

export {
  getJapaneseWords,
  getJapaneseContent,
  getJapaneseSongs,
  getJapaneseWordsViaTopic,
  getTopicsWithFlashWordsToStudy,
  getJapaneseWordsViaSong,
};
