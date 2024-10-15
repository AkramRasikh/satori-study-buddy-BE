import { Request, Response } from 'express';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { getContent, uploadBufferToFirebase } from '../firebase/init';
import { content, japaneseContent } from '../firebase/refs';
import { getFirebaseAudioURL } from './get-audio-url';
import {
  fetchBufferFromUrl,
  saveBufferToFile,
  useFFmpeg,
} from './get-audio-duration';
import { updateAndCreateReview } from '../firebase/update-and-create-review';

const folderPath = 'japanese-audio';

const mp3Utils = (app) => {
  app.post('/get-segments', async (req: Request, res: Response) => {
    // const unifiedAudioMP3 = req?.body?.unifiedAudioMP3;
    const topicName = req?.body?.topicName;

    try {
      const japaneseContentData = await getContent({ ref: japaneseContent });
      const thisTopicsData = japaneseContentData[topicName];

      let startAt = 0;

      const withDuration = await Promise.all(
        thisTopicsData
          .map(async (item, index) => {
            const audioUrl = getFirebaseAudioURL(item.id);
            const id = item.id;
            const tempFilePath = path.join(__dirname, `${id}.mp3`);
            try {
              const buffer = await fetchBufferFromUrl(audioUrl);
              await saveBufferToFile(buffer, tempFilePath);

              const formatData = (await useFFmpeg(tempFilePath)) as any;
              const duration = formatData.format.duration;

              return {
                ...item,
                duration,
                position: index,
                audioUrl,
              };
            } catch (error) {
              console.error('Error processing item:', error);
              return null; // or handle error as needed
            } finally {
              // Always ensure to delete temporary file and close resources
              if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
              }
            }
          })
          .sort((a, b) => a.position - b.position),
      );

      const formatWithStartAt = withDuration?.map((item) => {
        const position = item.position;
        const duration = item.duration;
        if (position > 0) {
          startAt += duration;
        }
        return {
          ...item,
          startAt,
        };
      });

      res.status(200).send({
        data: formatWithStartAt,
      });
    } catch (error) {
      res.status(401);
    }

    // getAudio
  });

  app.post('/combine-audio', (req: Request, res: Response) => {
    const audioFiles = req?.body?.audioFiles;
    const mp3Name = req?.body?.mp3Name;
    const language = req?.body?.language;
    const topicName = req?.body?.topicName;
    const formattedFirebaseName = folderPath + '/' + mp3Name + '.mp3';

    const outputFilePath = path.join(__dirname, 'output.mp3');

    const command = ffmpeg();
    audioFiles.forEach((file) => {
      command.input(file);
    });

    command
      .on('start', function (commandLine) {
        console.log('Spawned ffmpeg with command: ' + commandLine);
      })
      .on('error', function (err, stdout, stderr) {
        console.error('Error: ' + err.message);
        console.error('ffmpeg stderr: ' + stderr);
        res.status(500).send('Error processing audio files');
      })
      .on('end', async () => {
        console.log('Files have been merged successfully');

        const buffer = fs.readFileSync(outputFilePath);

        try {
          const url = await uploadBufferToFirebase({
            buffer,
            filePath: formattedFirebaseName,
          });

          const fieldToUpdateRes = await updateAndCreateReview({
            ref: content,
            contentEntry: topicName,
            fieldToUpdate: { hasAudio: true },
            language,
          });

          if (fieldToUpdateRes) {
            res.status(200).send({ url });
          } else {
            res.status(500).send('Error uploading to Firebase Storage 1');
          }
        } catch (error) {
          console.error('Error uploading to Firebase Storage:', error);
          res.status(500).send('Error uploading to Firebase Storage 2');
        } finally {
          fs.unlinkSync(outputFilePath); // Clean up the temporary file
        }
      })
      .mergeToFile(outputFilePath, __dirname);
  });
};

export { mp3Utils };
