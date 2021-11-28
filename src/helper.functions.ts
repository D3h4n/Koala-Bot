import config from './utils/config';
import { CommandInteraction, TextChannel } from 'discord.js';
import { client } from './index';
import lottoModel from './models/lotto.model';
import economyServices from './services/economy.services';
import guildServices from './services/guild.services';
import {promises} from 'fs';
import {resolve} from 'path';

// functions
export const log = async function logEveryCommand(interaction: CommandInteraction) {
  console.log(
    `[server] User: ${interaction.user.username} Channel: ${await (interaction.channel as TextChannel).name} Command: ${interaction.command}`
  );
};

const checkTime = function checkTimeFrequency(date: Date, frequency: number) {
  let diff = date.getTime() % frequency;

  return diff < 1e4 || diff > frequency - 1e4;
};

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

export async function* getFiles(dir: string): AsyncGenerator<string, void, void> {
  const dirents = await (await promises.readdir(dir, { withFileTypes: true }));
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}
