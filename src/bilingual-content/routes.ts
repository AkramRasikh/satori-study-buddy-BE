import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { combineFromYoutubeSRTData, combineSRTData } from './combine-srt-data';
import { content, songs } from '../firebase/refs';
import {
  addContentArr,
  addLyricsToFirestore,
  uploadBufferToFirebase,
} from '../firebase/init';
import { extractYoutubeAudio } from './extract-youtube-audio';
import { extractSrtData } from './extract-srt-data';
import {
  extractMP3Section,
  getUpdateToAndFromValues,
  splitByInterval,
  splitSubtitlesByInterval,
} from './output/youtube-txt-file';
import { getRefPath } from '../utils/get-ref-path';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';

const folderPath = 'japanese-songs';

const bilingualContentRoutes = (app) => {
  app.post(
    '/combine-with-url',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const title = req?.body?.title;
      const youtubeId = req?.body?.youtubeId;
      const language = req?.body?.language;
      const targetLang = req?.body?.targetLang || 'ja';
      const outputDir = path.join(__dirname, 'output');

      const refPath = getRefPath({ ref: songs, language });
      const url = 'https://www.youtube.com/watch?v=' + youtubeId;

      try {
        const buffer = await extractYoutubeAudio({ url, title });
        console.log('## extracted video');
        const englishContent = await extractSrtData({ youtubeId, lang: 'en' });
        console.log('## extracted english Subs');
        const extractedTargetLangContent = await extractSrtData({
          youtubeId,
          lang: targetLang,
        });
        console.log('## extracted target lang subs');
        const japaneseSongContentEntry = await combineFromYoutubeSRTData({
          title,
          englishSRT: englishContent,
          japaneseSRT: extractedTargetLangContent,
        });
        console.log('## combined subs');
        await uploadBufferToFirebase({
          buffer,
          filePath: folderPath + '/' + title + '.mp3',
        });
        console.log('## uploading to firestore');
        await addLyricsToFirestore({
          ref: refPath,
          contentEntry: japaneseSongContentEntry,
        });
        res.send(japaneseSongContentEntry).status(200);
      } catch (error) {
        console.log('## Error combine-with-url: ', error);
        res.send().status(401);
      } finally {
        if (fs.existsSync(outputDir)) {
          await fs.rm(outputDir, (res) => {
            console.log('## remove output res', res);
          });
        }
      }
    },
  );
  app.post(
    '/combine',
    checkMandatoryLanguage,
    async (req: Request, res: Response) => {
      const title = req?.body?.title;
      const language = req?.body?.language;
      const refPath = getRefPath({ ref: songs, language });

      const japaneseSongContentEntry = await combineSRTData({ title });
      await addLyricsToFirestore({
        ref: refPath,
        contentEntry: japaneseSongContentEntry,
      });
      res.send(japaneseSongContentEntry).status(200);
    },
  );

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
      const filePath = path.resolve(__dirname, 'output', 'what-is-sakoku.txt');
      const mp3FileInput = path.resolve(
        __dirname,
        'output',
        'what-is-sakoku.mp3',
      );

      const outputFile = (title) => {
        return path.resolve(__dirname, 'output', `${title}.mp3`);
      };

      const outputJson = splitSubtitlesByInterval(filePath);
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
          await addContentArr({
            ref: refPath,
            contentEntry: {
              title: item.title,
              hasAudio: item.hasAudio,
              origin: 'youtube',
              content: item.content,
              url,
              interval: splits,
            },
          });
        }
      } catch (error) {
        console.error('Error creating snippets:', error);
      }

      res.send(updateToAndFromValues).status(200);
    },
  );
};

export { bilingualContentRoutes };
