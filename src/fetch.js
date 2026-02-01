import { google } from "googleapis";
import "dotenv/config";
import Content from "../config/content.json" with { type: "json" };
import Settings from "../config/settings.json" with { type: "json" };

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YT_API_KEY,
});

function _randomItem(arr) {
  const randomNumber = Math.floor(Math.random() * arr.length);
  const randomItem = arr[randomNumber];
  console.log(
    `Random item selected. Index #${randomNumber + 1} chosen from ${arr.length} items.`,
  );
  return randomItem;
}

async function _getUploadsPlaylist(channelId) {
  const res = await youtube.channels.list({
    part: "contentDetails",
    id: channelId,
  });

  const uploads =
    res.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploads) throw new Error("Uploads playlist not found");
  return uploads;
}

export default async function fetchVideo(contentId) {
  // Content ID tests
  // 1. No content ID
  if (!contentId) throw new Error("No content ID given");
  // 2. Content ID isn't a string
  if (typeof contentId !== "string")
    throw new Error("Content ID isn't a string: " + contentId);
  // 3. Content ID doesn't exist
  if (!Content[contentId])
    throw new Error("Content ID doesn't exist: " + contentId);

  const entry = Content[contentId];

  // Entry tests
  // 1. Entry doesn't exist
  if (!entry)
    throw new Error(
      `Invalid content ID selected, ${contentId} not found. Available IDs: ${Object.keys(Content).join(", ")}`,
    );
  // 2. Entry doesn't have a type
  if (!entry?.type) throw new Error(`Entry ${entry} doesn't have a type`);

  const { type, id } = entry;

  // 1. Random pool
  if (type === "random_pool") {
    console.log("Random pool selected");
    const pool = entry?.pool;

    if (!pool) throw new Error("Pool array not found in entry: " + entry);
    if (pool?.length === 0) throw new Error("Pool is empty in entry: " + entry);
    if (pool?.includes(String(contentId)))
      throw new Error("Pool cannot contain itself: [" + entry.pool + "]");

    if (pool?.length === 1) {
      console.warn(
        "Warning: Pool has only one entry, consider reconfiguring to improve speed: " +
          entry.pool,
      );
      console.log("Selected entry:", pool[0]);
      return fetchVideo(pool[0]);
    }

    const newEntry = _randomItem(pool);
    console.log("Selected entry:", newEntry);
    return fetchVideo(newEntry);
  }

  // 2. Fixed video
  if (type === "fixed_video") {
    console.log("Fixed video selected");
    return id;
  }

  // 3. Latest video from channel
  if (type === "channel_latest") {
    console.log("Latest video from channel selected");
    const uploadsId = await _getUploadsPlaylist(id);

    const res = await youtube.playlistItems.list({
      part: "snippet",
      playlistId: uploadsId,
      maxResults: 1,
    });

    return res.data.items?.[0]?.snippet?.resourceId?.videoId;
  }

  // 4. Random video from channel
  if (type === "channel_random") {
    console.log("Random video from channel selected");
    const uploadsId = await _getUploadsPlaylist(id);

    const maxResults =
      contentId.config?.maxResults ?? Settings.defaultMaxResults;

    if (maxResults > 50 || maxResults < 1)
      throw new Error("Max results must be 1 - 50, got " + maxResults);

    const params = {
      part: "snippet",
      playlistId: uploadsId,
      maxResults,
    };

    const res = await youtube.playlistItems.list(params);

    const items = res.data.items || [];
    return _randomItem(items)?.snippet?.resourceId?.videoId;
  }

  // 5. Latest video from playlist
  if (type === "playlist_latest") {
    console.log("Latest video from playlist selected");
    const res = await youtube.playlistItems.list({
      part: "snippet",
      playlistId: id,
      maxResults: 1,
    });

    return res.data.items?.[0]?.snippet?.resourceId?.videoId;
  }

  // 6. Random video from playlist
  if (type === "playlist_random") {
    console.log("Random video from playlist selected");
    const maxResults =
      contentId.config?.maxResults ?? Settings.defaultMaxResults;
    if (maxResults > 50 || maxResults < 1)
      throw new Error("Max results must be 1 - 50, got " + maxResults);
    const res = await youtube.playlistItems.list({
      part: "snippet",
      playlistId: id,
      maxResults,
    });

    const items = res.data.items || [];
    return _randomItem(items)?.snippet?.resourceId?.videoId;
  }

  throw new Error(`Unsupported content type: ${type}`);
}
