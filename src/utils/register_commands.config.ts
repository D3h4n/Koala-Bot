import { ApplicationCommand, Collection } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';
import { promises } from 'fs';
import { resolve } from 'path';
import config from './config';
import Command from './common.commands.config';

const rest = new REST({version: "9"}).setToken(config.token!);

export async function readCommands (dir: string) {
  const commands: Collection<string, Command> = new Collection<string, Command>();

  for await (const f of getFiles(dir)) {
    if (f.endsWith(".js")) {
      const command: Command = new (require(f).default)();
   
      commands.set(command.name, command);
    }
  }

  return commands;
}

export async function registerApplicationCommands (clientid: string, commands: Collection<String, Command>) {
  await rest.put(Routes.applicationCommands(clientid), {
    body: commands.filter(command => !command.guildid).map(command => {
      console.log(`Adding commmand ${command.name}`)
      return command.toJSON()
    })
  });
}

export async function deregisterApplicationCommands (clientid: string) {
  return rest.put(Routes.applicationCommands(clientid), {body:[]});
}

export async function registerGuildCommands (clientid: string, guildid: string, commands: Collection<String, Command>) {
  const guildCommands = commands.filter(command => command.guildid === guildid);

  await rest.put(Routes.applicationGuildCommands(clientid, guildid), {
    body: guildCommands.map(command => command.toJSON())
  });
}

export async function updateGuildCommandPermissions(guildid: string, commands: Collection<string, Command>) {
    commands = commands.filter(command => command.guildid === guildid);

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

export function deregisterGuildCommands (clientid: string, guildid: string): Promise<unknown> {
  return rest.put(Routes.applicationGuildCommands(clientid, guildid), {body: []});
}

export async function* getFiles(dir: string): AsyncGenerator<string, void, void> {
  const dirents = await promises.readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
  
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}
