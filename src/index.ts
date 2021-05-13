import { Client } from 'discord.js';
import Distube from 'distube';
import config from './utils/config';
import initDistube from './utils/distube.config';

import commands from './commands/index.commands.setup';
import { log, parseCommand } from './helper.functions';

const { token, prefix, botStatus } = config; // config info for bot

export const client = new Client(); // initialize client

// log that bot is running
client.once('ready', () => {
  console.log(`[server] Loaded ${commands.size} commands`);

  client.user!.setPresence({
    status: 'online',
    activity: {
      name: botStatus,
      type: 'PLAYING',
    },
  });
});

// runs every time a message is sent in the server
client.on('message', (message) => {
  if (
    // check for valid message
    message.content.startsWith(prefix) &&
    !message.author.bot &&
    message.author !== client.user
  ) {
    // parse message
    let args: string[] = [];

    try {
      args = parseCommand(message.content.slice(prefix.length).trim());
    } catch (error) {
      message.channel.send('`' + error + '`');
      return;
    }

    let commandName = args[0].toLowerCase();

    // check for the correct command and execute it
    let command = commands.get(commandName);
    if (command) {
      command.action(message, args);
      log(message);
      return;
    }

    // send message if command isn't found
    message.channel.send(`That command was not found`);
    return;
  }
});

export const distube = initDistube(
  new Distube(client, {
    searchSongs: false,
    emitNewSongOnly: true,
  })
);

client.login(token);
