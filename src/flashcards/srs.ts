import { createEmptyCard, generatorParameters, fsrs } from 'ts-fsrs';

export const retentionKey = {
  vocab: 0.98,
  sentences: 0.95,
  topic: 0.95,
  media: 0.93,
};

const getEmptyCard = () => {
  console.log('## getEmptyCard');
  const cardObj = createEmptyCard() as any;
  cardObj.ease = 2.5; // Default ease factor for a new cardObj
  cardObj.interval = 0; // Initial interval for a new cardObj
  cardObj.state = 'new'; // Set the cardObj state
  return cardObj;
};

// grade = [1,2,3,4]
const reviewCardAlgo = ({ contentType, card, grade }) => {
  console.log('## reviewCardAlgo 1');
  const params = generatorParameters({
    maximum_interval: 1000,
    request_retention: retentionKey[contentType],
  });
  const f = fsrs(params);

  let cardObj = card ? card : getEmptyCard();

  const nextReview = f.repeat(cardObj, new Date()) as any;
  // Manually update cardObj properties if repeat didn't update them
  if (!nextReview?.last_review) {
    console.log('## NEW CARD!');
    cardObj.last_review = new Date(); // Set the last review date to now
    cardObj.state = 'reviewed'; // Update state to indicate it's been reviewed
  }
  const postReviewedCard = nextReview[grade].card;
  // console.log('## Card after: ', postReviewedCard);
  console.log('## Card after (nextReview): ', nextReview);
  return postReviewedCard;
};

export { reviewCardAlgo };

// const existingCard = {
//   due: '2024-10-09T18:18:35.063Z',
//   stability: 0.4072,
//   difficulty: 7.2102,
//   elapsed_days: 0,
//   scheduled_days: 0,
//   reps: 1,
//   lapses: 0,
//   state: 1,
//   last_review: '2024-10-09T18:17:35.063Z',
//   ease: 2.5,
//   interval: 0,
// };
// const oldExistingCard = {
//   due: '2024-09-09T18:18:35.063Z',
//   stability: 0.4072,
//   difficulty: 7.2102,
//   elapsed_days: 0,
//   scheduled_days: 0,
//   reps: 1,
//   lapses: 0,
//   state: 1,
//   last_review: '2024-08-09T18:17:35.063Z',
//   ease: 2.5,
//   interval: 0,
// };
// reviewCard({ contentType: 'vocab', grade: 4, card: oldExistingCard });
