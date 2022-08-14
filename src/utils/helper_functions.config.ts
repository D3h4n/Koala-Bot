import {
   ChatInputCommandInteraction,
   TextChannel,
   Interaction,
   CacheType,
} from 'discord.js';
import { client, commands } from '../index';
import config from './config';
import lottoModel from '../models/lotto.model';
import economyServices from '../services/economy.services';
import guildServices from '../services/guild.services';

export const log = async function logEveryCommand(
   interaction: ChatInputCommandInteraction
): Promise<void> {
   console.log(
      `[server] User: ${interaction.user.username} Channel: ${
         (interaction.channel as TextChannel).name
      } Command: ${interaction.commandName}`
   );
};

export async function handleInteraction(
   interaction: Interaction<CacheType>
): Promise<void> {
   if (interaction.isButton()) {
      await interaction.deferUpdate();
      return;
   }
   if (!interaction.isChatInputCommand()) return;

   const command = commands.get(interaction.commandName);

   command?.action(interaction);
   log(interaction);
}

const checkTime = function checkTimeFrequency(date: Date, frequency: number) {
   const diff = date.getTime() % frequency;

   return diff < 1e4 || diff > frequency - 1e4;
};

export async function dataBaseCleanup(): Promise<void> {
   if (!checkTime(new Date(), config.cleanUpFrequency)) return;

   console.log('[server] running database cleanup');

   // cleanup old lottos/guesses
   const lottos = await lottoModel.find({ done: true });

   lottos.forEach(async (lotto) => {
      const guesses = await economyServices.getGuesses(lotto.id);

      guesses.forEach((guess) => {
         guess.delete();
      });

      await lotto.delete();
   });
}

export async function postureCheck(): Promise<void> {
   const guilds = await guildServices.GetGuilds();

   guilds.forEach((guild) => {
      if (!guild.runPostureCheck) return;

      const date = new Date();

      const hours = date.getUTCHours();

      if (
         !checkTime(
            date,
            guild.postureCheckFrequency || config.eventLoopTimeDelay
         ) ||
         (hours > 2 && hours < 14)
      ) {
         return;
      }

      console.log(
         `[server] sending posture check for guild ${guild.guildName}`
      );

      if (!guild.postureCheckChannelId) {
         console.error('ERROR: Failed to get channel id for posture check');
         return;
      }

      const channel = client.channels.resolve(
         guild.postureCheckChannelId
      ) as TextChannel;

      if (!channel) {
         console.error('Channel not found');
         return;
      }

      channel.send(guild.postureCheckMessage ?? 'No Message');
   });
}

/**
 * Parses a time string in the form hh:mm:ss and returns the time in seconds
 *
 * @param input
 * @returns the time in seconds
 */
export function parseTimeString(input: string): number {
   const time = new RegExp(/^([0-5]?\d:){0,2}[0-5]?\d$/).exec(input)?.[0];

   return (
      time
         ?.split(':')
         ?.map(Number)
         ?.reduce((total, curr) => total * 60 + curr) ?? 0
   );
}

export function timeToString(time: number): string {
   const seconds = time % 60;

   time = Math.floor(time / 60);
   const minutes = time % 60;

   const hours = Math.floor(time / 60);

   let result = seconds.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
   });

   result =
      minutes.toLocaleString('en-US', {
         minimumIntegerDigits: 2,
      }) +
      ':' +
      result;

   if (hours > 0) {
      result =
         hours.toLocaleString('en-US', {
            minimumIntegerDigits: 2,
         }) +
         ':' +
         result;
   }

   return result;
}
