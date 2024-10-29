import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { combineFromYoutubeSRTData, combineSRTData } from './combine-srt-data';
import { content, songs } from '../firebase/refs';
import { addLyricsToFirestore, uploadBufferToFirebase } from '../firebase/init';
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
import { addContentLogic } from '../firebase/add-content/add-content-logic';
import { getAudioFolderViaLang } from '../utils/get-audio-folder-via-language';
import { cutAudioFromAudio } from '../mp3-utils/cut-audio-from-audio';
import { timeToSeconds } from '../utils/time-string-to-seconds';
import {
  eligibleLanguages,
  languageNeedsTrimming,
} from '../eligible-languages';

const folderPath = 'japanese-songs';
const youtube = 'youtube';

const outputFile = (title) => {
  return path.resolve(__dirname, 'output', `${title}.mp3`);
};

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
        const { buffer } = await extractYoutubeAudio({ url, title });
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
      const filePath = path.resolve(__dirname, 'output', 'surah-an-nasr.txt');
      const mp3FileInput = path.resolve(
        __dirname,
        'output',
        'surah-an-nasr.mp3',
      );

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
            },
          });
        }
      } catch (error) {
        console.error('/youtube-to-audio-snippets-nested:', error);
      }

      res.send(updateToAndFromValues).status(200);
    },
  );
};

export { bilingualContentRoutes };
