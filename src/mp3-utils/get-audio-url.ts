export const getFirebaseAudioURL = (mp3FileName: string) => {
  const baseURL = process.env.FIREBASE_AUDIO_URL;
  const firebaseToken = process.env.FIREBASE_STORAGE_ID;
  const url = `${baseURL}${mp3FileName}.mp3?alt=media&token=${firebaseToken}`;

  return url;
};
