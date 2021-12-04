require('dotenv').config();

export default {
  token: process.env.DISCORD_BOT_TOKEN, // token for discord bot
  clientId: process.env.CLIENT_ID, // client id of discord bot
  youtubeApiKey: process.env.YOUTUBE_API_KEY, // token for google api
  dbURI: process.env.MONGO_DB_URI ?? 'mongodb://localhost/koala-bot', // URI for database
  dbUser: process.env.MONGO_DB_USER, // username for database access
  dbPass: process.env.MONGO_DB_PASS, // password for database access
  botStatus:
    process.env.NODE_ENV === 'production'
      ? 'SLASH COMMANDS YO'
      : 'in maintenance', // bot status
  prefix: '$', // command prefix
  onlineMessage: process.env.NODE_ENV === 'production', // boolean to display online message
  mainColor: 0x181818, // accent colour of embedded messages
  msgTimeout: 1e4, // time limit for message deletion (ms)
  helpPageLength: 5, // length of help pages
  helpTimeLimit: 2e4, // time limit of interactive help page (ms)
  queuePageLength: 10, // number of songs per queue page
  queueTimeLimit: 3e4, // time limit of interactive queue (ms)
  timeoutMaxLimit: 6e5, // limit for timeouts (ms)
  maxRandomNumbers: 20, // limit of random numbers
  eventLoopTimeDelay: 1.8e6, // time between each event loop (ms)
  cleanUpFrequency: 6.048e8,
};
