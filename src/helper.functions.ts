import commands, { commandAliases } from './commands/index.commands.setup';
import config from './utils/config';
import { Message } from 'discord.js';
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

const parseCommand = function (input: string) {
  let args: string[] = []; //args array
  let word = ''; // store each arg

  // check if quotations are completed
  if ((input.match(/"/g)?.length ?? 0) % 2 !== 0) {
    throw new Error('`Incomplete quotes`');
  }

  // add space to the end of the command
  input += ' ';

  for (let i = 0; i < input.length; i++) {
    // if space add word to args and clear word
    if (input[i] !== ' ' && input[i] !== '"') {
      // add character to word
      word += input[i];
      continue;
    }

    // if quote add all characters between quotes
    if (input[i] === '"') {
      for (i++; input[i] !== '"' && i < input.length; i++) {
        word += input[i];
      }
    }

    word && args.push(word);
    word = '';
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
      message.channel.send(error);
      return;
    }

    let commandName = args[0].toLowerCase();

    // check for the correct command and execute it
    commands
      .get(commandAliases.get(commandName) ?? commandName)
      ?.action(message, args);

    log(message);
  }
}
