import { Message } from 'discord.js';
import commands from './commands/index.commands.setup';
import config from './utils/config';
import { client } from './index';

// functions
const log = function logEveryCommand({
  content,
  author,
  guild,
  channel,
}: Message) {
  const textChannelName = guild?.channels.resolve(channel.id)?.name;

  console.log(
    `[server] User: ${author.tag} Channel: ${textChannelName} Command: ${content}`
  );
};

const parseCommand = function (cmd: string) {
  let args: string[] = []; //args array
  let word = ''; // store each arg

  // check if quotations are completed
  if ((cmd.match(/"/g)?.length ?? 0) % 2 !== 0) {
    throw new Error('Incomplete quotes');
  }

  // add space to the end of the command
  cmd += ' ';

  for (let i = 0; i < cmd.length; i++) {
    // if space add word to args and clear word
    if (cmd[i] === ' ') {
      if (word) {
        args.push(word);
      }

      word = '';
      continue;
    }

    if (cmd[i] === '"') {
      // add to word characters until next quote
      for (i++; cmd[i] !== '"' && i < cmd.length; i++) {
        word += cmd[i];
      }
    } else {
      // add character to word
      word += cmd[i];
    }
  }

  return args;
};

export default function handleMessage(message: Message) {
  if (
    // check for valid message
    message.content.startsWith(config.prefix) &&
    !message.author.bot &&
    message.author !== client.user
  ) {
    // parse message
    let args: string[] = [];

    try {
      args = parseCommand(message.content.slice(config.prefix.length).trim());
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
  }
}
