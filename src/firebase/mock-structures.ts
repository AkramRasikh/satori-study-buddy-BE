const databaseStructure = {
  japaneseContent: {
    'general-01': [
      {
        id: 'a-b-c',
        targetLang:
          '私は明確に自分自身を社会主義者とは呼んでいませんが、その言葉に近い感じがします。',
        baseLang:
          'I don’t explicitly call myself a socialist but I feel close to the word.',
        notes: 'Some dummy notes!',
        audioId:
          'https://firebasestorage.googleapis.com/v0/b/language-content-storage.appspot.com/o/japanese-audio%2F1383a7de-305a-4fc4-8c4a-9d62d694ef51?alt=media&token=${token}',
      },
    ],
  },
  japaneseWords: {
    社会主義者: {
      contexts: ['a-b-c'],
      reviewedTimeStamps: [new Date().toString()],
    },
  },
};
