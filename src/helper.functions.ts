import config from './utils/config';
import { CommandInteraction, TextChannel, Collection, Interaction, CacheType } from 'discord.js';
import { client } from './index';
import lottoModel from './models/lotto.model';
import economyServices from './services/economy.services';
import guildServices from './services/guild.services';
import {promises} from 'fs';
import {resolve} from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Command from './common.commands.config';

// create a map of commands
const commands: Collection<string, Command> = new Collection<string, Command>();
const rest = new REST({version: "9"}).setToken(config.token!);

// functions
export async function readCommands (dir: string) {
  for await (const f of getFiles(dir)) {
    if (f.endsWith(".js")) {
      const command: Command = new (require(f).default)();
   
      commands.set(command.name, command);
    }
  }
}

export async function registerApplicationCommands (clientid: string) {
  await rest.put(Routes.applicationCommands(clientid), {
    body: commands.filter(command => !command.guildid).map(command => command.toJSON())
  });
}

export async function deregisterApplicationCommands (clientid: string) {
  return rest.put(Routes.applicationCommands(clientid), {body:[]});
}

export async function registerGuildCommands (clientid: string, guildid: string) {
  const guildCommands = commands.filter(command => command.guildid === guildid);

  await rest.put(Routes.applicationGuildCommands(clientid, guildid), {
    body: guildCommands.map(command => command.toJSON())
  });
}

export async function updateGuildCommandPermissions(guildid: string) {
  let applicationCommands = (await client.guilds.fetch(guildid)).commands.cache.values();
  const guildCommands = commands.filter(command => command.guildid === guildid);

  for (let command of applicationCommands) {
    console.log(command.name);
    let guildCommand = guildCommands.get(command.name);
    
    if (guildCommand && guildCommand.permissions) {

      command.permissions.add({
        permissions: guildCommand.permissions
      })
    }
  }
}

export function deregisterGuildCommands (clientid: string, guildid: string): Promise<unknown> {
  return rest.put(Routes.applicationGuildCommands(clientid, guildid), {body: []});
}

export const log = async function logEveryCommand(interaction: CommandInteraction) {
  console.log(
    `[server] User: ${interaction.user.username} Channel: ${await (interaction.channel as TextChannel).name} Command: ${interaction.command}`
  );
};

export async function handleInteraction(interaction: Interaction<CacheType>) {
  if (!interaction.isCommand()) return;
  
  let command = commands.get(interaction.commandName);

  command?.action(interaction);
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
