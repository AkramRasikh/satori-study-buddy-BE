import { formatTranscriptBasedOnTime } from './format-transcript-based-on-time';

// const baseMockData = [
//   {
//     baseLang: '(Goto) Wow!  Good morning,',
//     id: '0e9a6438-8ec3-4531-a7a0-7e02d28f2268',
//     targetLang: '(後藤)うわっ!おはようございます',
//     time: 4,
//   },
//   {
//     baseLang: 'amazing!  There it is!',
//     id: '4c462b7b-e6e4-4a4f-9a78-bb57724fe1d5',
//     targetLang: 'すごい!いてた!',
//     time: 5,
//   },
//   {
//     baseLang: '(Fukutoku) Oh! (Goto) Good morning.',
//     id: '5f515e3f-69f3-490a-a4a7-e7f20a9b481d',
//     targetLang: '(福徳)おお!(後藤)おはようございます',
//     time: 6,
//   },
//   {
//     baseLang: '(Fukutoku) Oh, shall we eat together? (Goto) Is that okay?',
//     id: 'd50d0ef5-41ac-432a-b606-4809001fcdb0',
//     targetLang: '(福徳)ああ一緒に食う?(後藤)いいですか?',
//     time: 8,
//   },
//   {
//     baseLang: "(Fukutoku) Oh, it's fine. (Goto) Sorry,",
//     id: '81f778c2-1b88-4c1e-8e36-e8ca8ec06b0a',
//     targetLang: '(福徳)おおいいよいいよ(後藤)すいません',
//     time: 9,
//   },
//   {
//     baseLang: 'sorry!  Can I have one tempura bowl,',
//     id: '75a3730e-1d2f-4be1-abaa-38b2081b120a',
//     targetLang: 'すいません!天丼1つください',
//     time: 10,
//   },
// ];

const preTimeNeedsSquashing = [
  {
    baseLang: '(Goto) Wow!  Good morning,',
    id: '0e9a6438-8ec3-4531-a7a0-7e02d28f2268',
    targetLang: '(後藤)うわっ!おはようございます',
    time: 4,
  },
  {
    baseLang: 'amazing!  There it is!',
    id: '4c462b7b-e6e4-4a4f-9a78-bb57724fe1d5',
    targetLang: 'すごい!いてた!',
    time: 4,
  },
  {
    baseLang: '(Fukutoku) Oh! (Goto) Good morning.',
    id: '5f515e3f-69f3-490a-a4a7-e7f20a9b481d',
    targetLang: '(福徳)おお!(後藤)おはようございます',
    time: 6,
  },
  {
    baseLang: '(Fukutoku) Oh, shall we eat together? (Goto) Is that okay?',
    id: 'd50d0ef5-41ac-432a-b606-4809001fcdb0',
    targetLang: '(福徳)ああ一緒に食う?(後藤)いいですか?',
    time: 8,
  },
  {
    baseLang: "(Fukutoku) Oh, it's fine. (Goto) Sorry,",
    id: '81f778c2-1b88-4c1e-8e36-e8ca8ec06b0a',
    targetLang: '(福徳)おおいいよいいよ(後藤)すいません',
    time: 8,
  },
];

const postTimeNeedsSquashing = [
  {
    baseLang: '(Goto) Wow!  Good morning,. amazing!  There it is!',
    id: '0e9a6438-8ec3-4531-a7a0-7e02d28f2268',
    targetLang: '(後藤)うわっ!おはようございます. すごい!いてた!',
    time: 4,
  },
  {
    baseLang: '(Fukutoku) Oh! (Goto) Good morning.',
    id: '5f515e3f-69f3-490a-a4a7-e7f20a9b481d',
    targetLang: '(福徳)おお!(後藤)おはようございます',
    time: 6,
  },
  {
    baseLang:
      "(Fukutoku) Oh, shall we eat together? (Goto) Is that okay?. (Fukutoku) Oh, it's fine. (Goto) Sorry,",
    id: 'd50d0ef5-41ac-432a-b606-4809001fcdb0',
    targetLang:
      '(福徳)ああ一緒に食う?(後藤)いいですか?. (福徳)おおいいよいいよ(後藤)すいません',
    time: 8,
  },
];

const pre2secondSpacing = [
  {
    baseLang: '(Goto) Wow!  Good morning,',
    id: '0e9a6438-8ec3-4531-a7a0-7e02d28f2268',
    targetLang: '(後藤)うわっ!おはようございます',
    time: 1,
  },
  {
    baseLang: 'amazing!  There it is!',
    id: '4c462b7b-e6e4-4a4f-9a78-bb57724fe1d5',
    targetLang: 'すごい!いてた!',
    time: 2,
  },
  {
    baseLang: '(Fukutoku) Oh! (Goto) Good morning.',
    id: '5f515e3f-69f3-490a-a4a7-e7f20a9b481d',
    targetLang: '(福徳)おお!(後藤)おはようございます',
    time: 3,
  },
  {
    baseLang: '(Fukutoku) Oh, shall we eat together? (Goto) Is that okay?',
    id: 'd50d0ef5-41ac-432a-b606-4809001fcdb0',
    targetLang: '(福徳)ああ一緒に食う?(後藤)いいですか?',
    time: 4,
  },
  {
    baseLang: "(Fukutoku) Oh, it's fine. (Goto) Sorry,",
    id: '81f778c2-1b88-4c1e-8e36-e8ca8ec06b0a',
    targetLang: '(福徳)おおいいよいいよ(後藤)すいません',
    time: 5,
  },
  {
    baseLang: 'sorry!  Can I have one tempura bowl,',
    id: '75a3730e-1d2f-4be1-abaa-38b2081b120a',
    targetLang: 'すいません!天丼1つください',
    time: 6,
  },
];

const post2secondSpacing = [
  {
    baseLang: '(Goto) Wow!  Good morning,. amazing!  There it is!',
    id: '0e9a6438-8ec3-4531-a7a0-7e02d28f2268',
    targetLang: '(後藤)うわっ!おはようございます. すごい!いてた!',
    time: 1,
  },
  {
    baseLang:
      '(Fukutoku) Oh! (Goto) Good morning.. (Fukutoku) Oh, shall we eat together? (Goto) Is that okay?',
    id: '5f515e3f-69f3-490a-a4a7-e7f20a9b481d',
    targetLang:
      '(福徳)おお!(後藤)おはようございます. (福徳)ああ一緒に食う?(後藤)いいですか?',
    time: 3,
  },

  {
    baseLang:
      "(Fukutoku) Oh, it's fine. (Goto) Sorry,. sorry!  Can I have one tempura bowl,",
    id: '81f778c2-1b88-4c1e-8e36-e8ca8ec06b0a',
    targetLang:
      '(福徳)おおいいよいいよ(後藤)すいません. すいません!天丼1つください',
    time: 5,
  },
];

test('should squash content that is on the same timestamp', () => {
  expect(formatTranscriptBasedOnTime(preTimeNeedsSquashing)).toEqual(
    postTimeNeedsSquashing,
  );
});

test('should squash content if the following line is inside a 2 second range', () => {
  expect(formatTranscriptBasedOnTime(pre2secondSpacing)).toEqual(
    post2secondSpacing,
  );
});
