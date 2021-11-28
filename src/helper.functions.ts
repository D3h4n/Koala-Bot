import commands, { commandAliases } from './index.commands.setup';
import config from './utils/config';
import { Message, TextChannel } from 'discord.js';
import { client } from './index';
import lottoModel from './models/lotto.model';
import economyServices from './services/economy.services';
import guildServices from './services/guild.services';

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

const checkTime = function checkTimeFrequency(date: Date, frequency: number) {
  let diff = date.getTime() % frequency;

  return diff < 1e4 || diff > frequency - 1e4;
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
      ?.callCommand(message, args);

    log(message);
  }
}

export async function dataBaseCleanup() {
  if (!checkTime(new Date(), config.cleanUpFrequency)) return;

  console.log('[server] running database cleanup');

  // cleanup old lottos/guesses
  let lottos = await lottoModel.find({ done: true });

  lottos.forEach(async (lotto) => {
    let guesses = await economyServices.getGuesses(lotto.id);

    guesses.forEach((guess) => {
      guess.delete();
    });

    await lotto.delete();
  });
}

export async function postureCheck() {
  const guilds = await guildServices.GetGuilds();

  guilds.forEach((guild) => {
    if (!guild.runPostureCheck) return;

    let date = new Date();

    let hours = date.getUTCHours();

    if (
      !checkTime(date, guild.postureCheckFrequency!) ||
      (hours > 2 && hours < 14)
    ) {
      return;
    }

    console.log(`[server] sending posture check for guild ${guild.guildName}`);

    const channel = client.channels.resolve(
      guild.postureCheckChannelId!
    ) as TextChannel;

    if (!channel) {
      console.error('Channel not found');
      return;
    }

    channel.send(guild.postureCheckMessage!);
  });
}
