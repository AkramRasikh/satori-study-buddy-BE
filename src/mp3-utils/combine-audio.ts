import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { uploadBufferToFirebase } from '../firebase/init';
import { getAudioFolderViaLang } from '../utils/get-audio-folder-via-language';

const getFirebasePathName = ({ language, mp3Name }) =>
  getAudioFolderViaLang(language) + '/' + mp3Name + '.mp3';

export const combineAudio = ({ audioFiles, language, mp3Name }) => {
  return new Promise((resolve, reject) => {
    const formattedFirebaseName = getFirebasePathName({ language, mp3Name });
    const outputFilePath = path.join(__dirname, 'output.mp3');

    const command = ffmpeg();
    audioFiles.forEach((file) => {
      command.input(file);
    });

    command
      .on('start', () => {
        console.log('Starting audio combination for ', mp3Name);
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg error: ${err.message}`)); // Reject the promise on error
      })
      .on('end', async () => {
        console.log(`${mp3Name} files have been merged successfully`);
        try {
          const buffer = fs.readFileSync(outputFilePath);
          await uploadBufferToFirebase({
            buffer,
            filePath: formattedFirebaseName,
          });
          resolve(true); // Resolve the promise on successful upload
        } catch (error) {
          reject(new Error('Error uploading files to firebase')); // Reject if Firebase upload fails
        } finally {
          fs.unlinkSync(outputFilePath); // Clean up the temporary file
        }
      })
      .mergeToFile(outputFilePath, __dirname);
  });
};
