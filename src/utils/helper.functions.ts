import config from './config';
import { CommandInteraction, TextChannel, Collection, Interaction, CacheType, ApplicationCommand } from 'discord.js';
import { client, commands } from '../index';
import lottoModel from '../models/lotto.model';
import economyServices from '../services/economy.services';
import guildServices from '../services/guild.services';
import Command from './common.commands.config';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';

export async function updateGuildCommandPermissions(guildid: string, commands: Collection<string, Command>) {
    commands = commands.filter(command => command.guildid === guildid);

    const rest = new REST({version: "9"}).setToken(config.token!);

    let test: ApplicationCommand[] = await rest.get(Routes.applicationGuildCommands(config.clientId!, guildid)) as ApplicationCommand[];

    let perms = test.map((command) => {
      return {
        id: command.id,
        permissions: commands.get(command.name)!.permissions!
      }
    }).filter(perm => perm)

    await rest.put(Routes.guildApplicationCommandsPermissions(config.clientId!, guildid), {
      body: perms
    })
}

export const log = async function logEveryCommand(interaction: CommandInteraction) {
  console.log(
    `[server] User: ${interaction.user.username} Channel: ${(interaction.channel as TextChannel).name} Command: ${interaction.commandName}`
  );
};

export async function handleInteraction(interaction: Interaction<CacheType>) {
  if (!interaction.isCommand()) return;
  
  let command = commands.get(interaction.commandName);

  command?.action(interaction);
  log(interaction);
}

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

