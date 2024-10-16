interface TagsType {
  tags: string[];
}
interface ReviewDataType {
  difficulty: number;
  due: Date;
  ease: number;
  elapsed_days: number;
  interval: number;
  lapses: number;
  last_review: Date;
  reps: number;
  scheduled_days: number;
  stability: number;
  state: number;
}
interface AdhocSentenceType {
  id: string;
  baseLang: string;
  hasAudio: string;
  targetLang: string;
  topic: string;
  notes?: string;
  context?: string;
  tags?: TagsType;
  reviewData?: ReviewDataType;
}

//   "baseLang": "The customs officer made me stand on a box and searched me. He even put his hands in my hair to check for anything",
//   "context": "This was when I was in the Japanese airport and I was going through customs",
//   "hasAudio": "7ef64c2f-9ec2-45dd-9d89-2610428bd1e6",
//   "id": "7ef64c2f-9ec2-45dd-9d89-2610428bd1e6",
//   "notes": "In this sentence, 'made me stand on a box' is translated as '僕をボックスの上に立たせて', which carries the connotation of being compelled or forced to stand on a box. 'he even put his hands in my hair' is translated as '髪の毛の中まで手を入れて', indicating the thoroughness of the search. The phrase 'check for anything' is generalised as '何かないか確認しました', which could refer to anything unusual or out of place.",
//   "reviewData": {
//     "difficulty": 3.2828565,
//     "due": "2024-10-18T08:26:13.397Z",
//     "ease": 2.5,
//     "elapsed_days": 0,
//     "interval": 0,
//     "lapses": 0,
//     "last_review": "2024-10-15T08:26:13.397Z",
//     "reps": 8,
//     "scheduled_days": 3,
//     "stability": 15.4722,
//     "state": 2
//   },
//   "tags": [
//     "travel",
//     "anecdote"
//   ],
//   "targetLang": "税関職員は僕をボックスの上に立たせて身体検査を行い、髪の毛の中まで手を入れて何かないか確認しました。",
//   "topic": "sudden-encounter"
// },
