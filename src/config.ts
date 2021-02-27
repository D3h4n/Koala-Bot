require("dotenv").config();

export default {
  token: process.env.DISCORD_BOT_TOKEN,
  prefix: "$",
  botStatus: process.env.DISCORD_BOT_STATUS ?? "$help",
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
};
