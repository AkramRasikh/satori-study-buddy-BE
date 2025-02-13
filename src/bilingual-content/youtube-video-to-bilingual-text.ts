import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { formatTranscriptBasedOnTime } from './format-transcript-based-on-time';
import { Request, Response } from 'express';
import { extractYoutubeAudioFromVideo } from './extract-youtube-audio-from-video';
import { cutAudioFromAudio } from '../mp3-utils/cut-audio-from-audio';
import {
  getUpdateToAndFromValues,
  splitByInterval,
} from './format-youtube-transcript';
import {
  getAudioFolderViaLang,
  getvideoFolderViaLang,
} from '../utils/get-audio-folder-via-language';
import { timeToSeconds } from '../utils/time-string-to-seconds';
import { uploadBufferToFirebase } from '../firebase/init';
import { addContentLogic } from '../firebase/add-content/add-content-logic';
import { v4 as uuidv4 } from 'uuid';
import { downloadYoutubeVideo } from './download-youtube-video';
import { extractAudioFromBaseAudio } from './extract-audio-from-base-audio';
import { checkYoutubeVideoCaptionStatus } from './check-youtube-video-caption-status';

const outputFile = (title) => {
  return path.resolve(__dirname, 'output', `${title}.mp3`);
};

const youtube = 'youtube';

const replaceLangKey = (subtitleUrl, closedCaptionLangCode) => {
  const url = new URL(subtitleUrl);
  const urlParams = new URLSearchParams(url.search);
  urlParams.set('lang', closedCaptionLangCode);
  url.search = urlParams.toString();
  const updatedUrl = url.toString();
  return updatedUrl;
};

const getBaseLangScript = async (subtitleUrl, youtubeId) => {
  const machineAutoTranslatedUrl = subtitleUrl + `&tlang=en`;
  try {
    const baseLangClosedCaption = await checkYoutubeVideoCaptionStatus(
      youtubeId,
    );
    if (baseLangClosedCaption) {
      console.log('## Attempting CC subs');
      const hasBaseLangCCUrl = replaceLangKey(
        subtitleUrl,
        baseLangClosedCaption,
      );
      const baseLangResponse = await fetch(hasBaseLangCCUrl);
      return { hasCC: true, baseLangContent: await baseLangResponse.json() };
    }
  } catch (error) {
    console.log('## Error getting base subtitles CC');
    try {
      console.log('## Attempting machine auto-subs');
      const baseLangResponse = await fetch(machineAutoTranslatedUrl);
      if (!baseLangResponse.ok) {
        throw new Error(`Failed to subtitles: ${baseLangResponse.statusText}`);
      }

      return { hasCC: false, baseLangContent: await baseLangResponse.json() };
    } catch (error) {
      console.log('## Failed to get Machine subs');
    }
  }
};

// Function to download YouTube video with a dynamic name

const getSquashedScript = async (subtitleUrl, youtubeId) => {
  const targetLangResponse = await fetch(subtitleUrl);
  if (!targetLangResponse.ok) {
    throw new Error(`Failed to subtitles: ${targetLangResponse.statusText}`);
  }
  const targetLangContent = await targetLangResponse.json();

  const { hasCC, baseLangContent } = await getBaseLangScript(
    subtitleUrl,
    youtubeId,
  );

  const squashedArr = targetLangContent.events.map((target, index) => {
    const base = baseLangContent.events.find(
      (b) => b.tStartMs === target.tStartMs,
    );

    const targetLang = target.segs
      .map((seg) => seg.utf8)
      .join('')
      .replace(/\n/g, ' ')
      .replaceAll(/\s/g, '');

    let baseLang = '';
    if (base) {
      baseLang = base.segs
        ?.map((seg) => seg.utf8)
        .join(' ')
        .replace(/\n/g, ' ')
        .trim();
    } else if (baseLangContent.events[index] && !hasCC) {
      baseLang = `**${baseLangContent.events[index]?.segs
        ?.map((seg) => seg.utf8)
        .join(' ')
        .replace(/\n/g, ' ')
        .trim()}`;
    } else if (baseLangContent.events[index] && hasCC) {
      const foundInRange = baseLangContent.events?.find((b, nestedIndex) => {
        if (
          Math.abs(b.tStartMs - target.tStartMs) <= 300 ||
          (Math.abs(b.tStartMs - target.tStartMs) <= 1000 &&
            Math.abs(nestedIndex - index) <= 2)
        ) {
          return true;
        }
      })?.segs;

      baseLang = foundInRange
        ? foundInRange
            ?.map((seg) => seg?.utf8)
            .join(' ')
            .replace(/\n/g, ' ')
            .trim()
        : '';
    }

    return {
      id: uuidv4(),
      time: Math.floor(target.tStartMs / 1000),
      baseLang,
      targetLang,
    };
  });
  const squashedTiming = formatTranscriptBasedOnTime(squashedArr);

  return squashedTiming;
};

const cutAudioIntoIntervals = async ({
  updateToAndFromValues,
  outputFilePathGrandCut,
  url,
  splits,
  start,
  language,
  hasVideo,
}) => {
  for (const item of updateToAndFromValues) {
    const audioPath = outputFile(item.title);
    await extractAudioFromBaseAudio(
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
        realStartTime: realStartTime,
        hasVideo,
      },
    });
  }
};

const youtubeVideoToBilingualText = async (req: Request, res: Response) => {
  const { language, timeRange, subtitleUrl, title, interval, hasVideo } =
    req.body;

  const start = timeRange.start;
  const finish = timeRange.finish;

  const urlParams = new URLSearchParams(new URL(subtitleUrl).search);
  const videoId = urlParams.get('v');
  const url = 'https://www.youtube.com/watch?v=' + videoId;

  try {
    const squashTranscript = await getSquashedScript(subtitleUrl, videoId);

    const baseTitle = timeRange ? title + '-base' : title;
    const resFromChunking = splitByInterval(squashTranscript, interval, title);
    const updateToAndFromValues = getUpdateToAndFromValues(resFromChunking);

    const { extractedBaseFilePath } = await extractYoutubeAudioFromVideo({
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

    if (hasVideo) {
      await downloadYoutubeVideo({ title, videoUrl: url });
      const outputFolder = path.resolve(__dirname, 'output');
      const videoPath = path.join(outputFolder, `${title}.mp4`);

      const videoFileBuffer = fs.readFileSync(videoPath);
      const formattedFirebaseName =
        getvideoFolderViaLang(language) + '/' + title + '.mp4';

      await uploadBufferToFirebase({
        buffer: videoFileBuffer,
        filePath: formattedFirebaseName,
        isVideo: true,
      });
    }

    await cutAudioIntoIntervals({
      updateToAndFromValues,
      outputFilePathGrandCut,
      url,
      splits: interval,
      start,
      language,
      hasVideo,
    });
    res.send(updateToAndFromValues);
  } catch (error) {
    console.log('## ERROR youtubeVideoToBilingualText', error);
    res.send().status(400);
  } finally {
    const outputDirectory = path.resolve(__dirname, 'output');

    // Get all files in the output directory
    const files = fs.readdirSync(outputDirectory);

    // Filter and unlink `.mp3` files
    files.forEach((file) => {
      const filePath = path.join(outputDirectory, file);
      if (file.startsWith(title)) {
        try {
          fs.unlinkSync(filePath); // Delete the file
          console.log(`Deleted: ${filePath}`);
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    });
  }
};

export { youtubeVideoToBilingualText };
