require('dotenv').config();

export default {
  token: process.env.DISCORD_BOT_TOKEN, // token for discord bot
  youtubeApiKey: process.env.YOUTUBE_API_KEY, // token for google api
  botStatus: process.env.DISCORD_BOT_STATUS ?? '$help', // bot status
  prefix: '$', // command prefix
  mainColor: 0x181818, // accent colour of embedded messages
  msgTimeout: 10000, // time limit for message deletion
  helpPageLength: 5, // length of help pages
  helpTimeLimit: 20000, // time limit of interactive help page
  queuePageLength: 10, // number of songs per queue page
  queueTimeLimit: 30000, // time limit of interactive queue
  timeoutMaxLimit: 600000, // limit for timeouts (10 minutes)
};
