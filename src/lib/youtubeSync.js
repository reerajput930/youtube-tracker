// Pulls uploads from the signed-in user's YouTube channel.
//
// The uploads playlist is read newest-first, so the same function serves two
// purposes with no special-casing:
//   - First run ever (no youtubeId saved yet): nothing matches "already
//     saved", so it pages through the whole playlist -> full history backfill.
//   - Every run after that: it stops as soon as it reaches a video whose
//     youtubeId is already saved -> only genuinely new uploads come back.

import { format } from "date-fns";
import { randomId } from "./id";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const SHORT_MAX_SECONDS = 180;
const MAX_PAGES = 40; // safety cap: 40 x 50 = 2000 videos

class YoutubeAuthError extends Error {}

async function youtubeFetch(path, accessToken) {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    throw new YoutubeAuthError("Your Google sign-in expired. Sign in again to sync.");
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${body.slice(0, 200)}`);
  }
  return res.json();
}

export function parseIsoDuration(iso) {
  // "PT12M40S" / "PT1H2M3S" / "PT45S" -> seconds
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || "");
  if (!match) return 0;
  const [, h, m, s] = match;
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

async function getUploadsPlaylistId(accessToken) {
  const data = await youtubeFetch(
    "channels?part=contentDetails&mine=true",
    accessToken
  );
  const playlistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!playlistId) {
    throw new Error("Couldn't find an uploads playlist for this channel.");
  }
  return playlistId;
}

async function collectNewPlaylistItems(playlistId, accessToken, existingYoutubeIds) {
  const newItems = [];
  let pageToken = "";
  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}` +
      (pageToken ? `&pageToken=${pageToken}` : "");
    const data = await youtubeFetch(url, accessToken);
    const items = data.items || [];

    for (const item of items) {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) continue;
      if (existingYoutubeIds.has(videoId)) {
        return newItems; // reached a video we already have - stop here
      }
      newItems.push(videoId);
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return newItems;
}

async function fetchVideoDetails(videoIds, accessToken) {
  const details = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const data = await youtubeFetch(
      `videos?part=contentDetails,snippet&id=${batch.join(",")}`,
      accessToken
    );
    details.push(...(data.items || []));
  }
  return details;
}

function toVideoRecord(item) {
  const lengthSec = parseIsoDuration(item.contentDetails?.duration);
  const publishedAt = item.snippet?.publishedAt ?? new Date().toISOString();
  return {
    id: randomId("v"),
    title: item.snippet?.title ?? "Untitled",
    date: format(new Date(publishedAt), "yyyy-MM-dd"),
    type: lengthSec <= SHORT_MAX_SECONDS ? "short" : "long",
    lengthSec,
    platform: "youtube",
    collabId: null,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    source: "youtube",
    youtubeId: item.id,
    createdAt: new Date().toISOString(),
  };
}

/**
 * @param {string} accessToken - Google OAuth access token with the
 *   youtube.readonly scope (from the Firebase Google sign-in result).
 * @param {string[]} existingYoutubeIds - youtubeId values already saved.
 * @returns {Promise<object[]>} new video records, newest first, not yet saved.
 */
export async function syncYoutubeUploads(accessToken, existingYoutubeIds) {
  const knownIds = new Set(existingYoutubeIds);
  const playlistId = await getUploadsPlaylistId(accessToken);
  const newVideoIds = await collectNewPlaylistItems(playlistId, accessToken, knownIds);
  if (newVideoIds.length === 0) return [];
  const details = await fetchVideoDetails(newVideoIds, accessToken);
  return details.map(toVideoRecord);
}

export { YoutubeAuthError };
