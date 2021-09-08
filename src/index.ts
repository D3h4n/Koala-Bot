import { Client, TextChannel } from 'discord.js';
import Distube from 'distube';
import config from './utils/config';
import initDistube from './utils/distube.config';
import initMongoose from './utils/mongoose.config';
import commands from './commands/index.commands.setup';
import initEventLoop from './utils/timer.config';
import handleMessage from './helper.functions';
import guildServices from './services/guild.services';

export const client = new Client(); // initialize client

// log that bot is running
client.once('ready', () => {
  console.log(`[server] Loaded ${commands.size} commands`);

  client.user!.setPresence({
    status: 'online',
    activity: {
      name: config.botStatus,
      type: 'PLAYING',
    },
  });

  if (config.onlineMessage) {
    const channel = client.guilds
      .resolve('310489953157120023')
      ?.channels.resolve('310489953157120023') as TextChannel;

    channel.send("Hello! I'm online now. 😊");
  }

  initEventLoop();
});

// runs every time a message is sent in the server
client.on('message', handleMessage);

client.on('guildCreate', (guild) => {
  console.log(`Joined new guild ${guild.name}`);
  guildServices.CreateGuild(guild).catch(console.error);
});

client.on('guildDelete', (guild) => {
  console.log(`Left Guild ${guild.name}`);
  guildServices.DeleteGuild(guild.id).catch(console.error);
});

export const distube = initDistube(
  new Distube(client, {
    searchSongs: false,
    emitNewSongOnly: true,
  })
);

initMongoose();

client.login(config.token);
