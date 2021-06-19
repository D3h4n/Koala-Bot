require('dotenv').config();

export default {
  token: process.env.DISCORD_BOT_TOKEN, // token for discord bot
  youtubeApiKey: process.env.YOUTUBE_API_KEY, // token for google api
  dbURI: process.env.MONGO_DB_URI ?? 'mongodb://localhost/koala-bot', // URI for database
  dbUser: process.env.MONGO_DB_USER, // username for database access
  dbPass: process.env.MONGO_DB_PASS, // password for database access
  botStatus:
    process.env.NODE_ENV === 'production'
      ? 'happy noises | $help'
      : 'in maintenance', // bot status
  prefix: '$', // command prefix
  mainColor: 0x181818, // accent colour of embedded messages
  msgTimeout: 1e4, // time limit for message deletion
  helpPageLength: 5, // length of help pages
  helpTimeLimit: 2e4, // time limit of interactive help page
  queuePageLength: 10, // number of songs per queue page
  queueTimeLimit: 3e4, // time limit of interactive queue
  timeoutMaxLimit: 6e5, // limit for timeouts (10 minutes)
  maxRandomNumbers: 20, // limit of random numbers
  eventLoopTimeDelay: 1.8e6, // time delay of event loop in ms
  runLottos: false, // toggle lottos
  lottoLength: 7.2e6, // number of ms each lotto lasts
  lottoChannelId: '842552370960400415',
  onlineMessage: true,
};
