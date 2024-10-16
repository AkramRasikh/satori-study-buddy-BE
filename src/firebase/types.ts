export interface FirebaseCoreQueryParams {
  ref: string;
  language: string;
}

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
