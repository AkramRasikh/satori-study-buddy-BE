import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { content } from '../firebase/refs';
import { uploadBufferToFirebase } from '../firebase/init';
import { extractYoutubeAudio } from './extract-youtube-audio';
import {
  extractMP3Section,
  getUpdateToAndFromValues,
  splitByInterval,
  splitSubtitlesByInterval,
} from './output/youtube-txt-file';
import { getRefPath } from '../utils/get-ref-path';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';
import { addContentLogic } from '../firebase/add-content/add-content-logic';
import { getAudioFolderViaLang } from '../utils/get-audio-folder-via-language';
import { cutAudioFromAudio } from '../mp3-utils/cut-audio-from-audio';
import { timeToSeconds } from '../utils/time-string-to-seconds';
import { languageNeedsTrimming } from '../eligible-languages';
import { youtubeVideoToBilingualText } from './youtube-video-to-bilingual-text';

const youtube = 'youtube';

export const outputFile = (title) => {
  return path.resolve(__dirname, 'output', `${title}.mp3`);
};

const bilingualContentRoutes = (app) => {
  app.post('/get-subtitles', youtubeVideoToBilingualText);
  app.post(
    '/youtube-to-audio-snippets',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const url = req?.body?.url;
      const title = req?.body?.title;
      const splits = req?.body?.interval;
      const language = req?.body?.language;
      const refPath = getRefPath({ ref: content, language });

      await extractYoutubeAudio({ url, title });
      const filePath = path.resolve(__dirname, 'output', `${title}.txt`);
      const mp3FileInput = path.resolve(__dirname, 'output', `${title}.mp3`);

      const outputJson = splitSubtitlesByInterval(filePath, null, null, null);
      const resFromChunking = splitByInterval(outputJson, splits, title);
      const updateToAndFromValues = getUpdateToAndFromValues(resFromChunking);
      try {
        // Sequential processing using for...of and await
        for (const item of updateToAndFromValues) {
          const audioPath = outputFile(item.title);
          const extractedSectionIndex = await extractMP3Section(
            mp3FileInput,
            outputFile(item.title),
            item.from,
            item.to,
          );

          const fileBuffer = fs.readFileSync(audioPath);
          const formattedFirebaseName = 'japanese-audio/' + item.title + '.mp3';

          // Upload audio snippet to Firebase
          await uploadBufferToFirebase({
            buffer: fileBuffer,
            filePath: formattedFirebaseName,
          });

          // Add content metadata to Firebase
          await addContentLogic({
            language,
            content: {
              title: item.title,
              hasAudio: item.hasAudio,
              origin: youtube,
              content: item.content,
              url,
              interval: splits,
              realStartTime: item.from,
            },
          });
        }
      } catch (error) {
        console.error('Error creating snippets:', error);
      }
    },
  );

  app.post(
    '/youtube-to-audio-snippets-nested',
    async (req: Request, res: Response) => {
      const url = req.body.url;
      const title = req.body.title;
      const splits = req.body.interval;
      const language = req.body.language;
      const timeRange = req.body?.timeRange;
      const start = timeRange?.start;
      const finish = timeRange?.finish;

      const txtFilePath = path.resolve(__dirname, 'output', `${title}.txt`);
      const baseTitle = timeRange ? title + '-base' : title;

      const { extractedBaseFilePath } = await extractYoutubeAudio({
        url,
        title: baseTitle,
      });

      const outputFilePathGrandCut = path.resolve(
        __dirname,
        'output',
        `${title}.mp3`,
      );

      await cutAudioFromAudio({
        inputFilePath: extractedBaseFilePath,
        outputFilePath: outputFilePathGrandCut,
        trimStart: start,
        trimEnd: finish,
      });

      const needsTrimmedSpaces = languageNeedsTrimming.includes(language);
      const outputJson = splitSubtitlesByInterval(
        txtFilePath,
        start,
        finish,
        needsTrimmedSpaces,
      );

      const resFromChunking = splitByInterval(outputJson, splits, title);

      const updateToAndFromValues = getUpdateToAndFromValues(resFromChunking);

      try {
        // Sequential processing using for...of and await
        for (const item of updateToAndFromValues) {
          const audioPath = outputFile(item.title);
          await extractMP3Section(
            outputFilePathGrandCut,
            outputFile(item.title),
            item.from,
            item.to,
          );

          const fileBuffer = fs.readFileSync(audioPath);
          const formattedFirebaseName =
            getAudioFolderViaLang(language) + '/' + item.title + '.mp3';

          const realStartTime = item.from + timeToSeconds(start);

          // Upload audio snippet to Firebase
          await uploadBufferToFirebase({
            buffer: fileBuffer,
            filePath: formattedFirebaseName,
          });

          // upload video
          // await uploadBufferToFirebase({
          //   buffer: fileBuffer,
          //   filePath: formattedFirebaseName,
          // });

          // // Add content metadata to Firebase
          await addContentLogic({
            language,
            content: {
              title: item.title,
              hasAudio: item.hasAudio,
              origin: youtube,
              content: item.content,
              url,
              interval: splits,
              realStartTime: realStartTime,
              hasVideo: true,
            },
          });
        }
      } catch (error) {
        console.error('/youtube-to-audio-snippets-nested:', error);
      } finally {
        const outputDirectory = path.resolve(__dirname, 'output');

        // Get all files in the output directory
        const files = fs.readdirSync(outputDirectory);

        // Filter and unlink `.mp3` files
        files.forEach((file) => {
          const filePath = path.join(outputDirectory, file);
          if (file.endsWith('.mp3') || file.endsWith('.txt')) {
            try {
              fs.unlinkSync(filePath); // Delete the file
              console.log(`Deleted: ${filePath}`);
            } catch (err) {
              console.error(`Error deleting file ${filePath}:`, err);
            }
          }
        });
      }

      res.send(updateToAndFromValues).status(200);
    },
  );
};

export { bilingualContentRoutes };
