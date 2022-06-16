import { Collection } from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import { promises } from 'fs';
import { resolve } from 'path';
import config from './config';
import Command from './common.commands.config';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rest = new REST({ version: '9' }).setToken(config.token!);

export async function readCommands(
   dir: string
): Promise<Collection<string, Command>> {
   const commands: Collection<string, Command> = new Collection<
      string,
      Command
   >();

   for await (const f of getFiles(dir)) {
      if (f.endsWith('.js')) {
         // eslint-disable-next-line @typescript-eslint/no-var-requires
         const command: Command = new (require(f).default)();

         commands.set(command.name, command);
      }
   }

   return commands;
}

export async function registerApplicationCommands(
   clientid: string,
   commands: Collection<string, Command>
): Promise<void> {
   await rest.put(Routes.applicationCommands(clientid), {
      body: commands
         .filter((command) => !command.guildid)
         .map((command) => {
            console.log(`Adding commmand ${command.name}`);
            return command.toJSON();
         }),
   });
}

export async function deregisterApplicationCommands(
   clientid: string
): Promise<void> {
   rest.put(Routes.applicationCommands(clientid), { body: [] });
}

export async function registerGuildCommands(
   clientid: string,
   guildid: string,
   commands: Collection<string, Command>
): Promise<void> {
   console.log(`Registering commands for guild id ${guildid}`);

   const guildCommands = [...commands.values()]
      .filter((command) => command.guildid && command.guildid === guildid)
      .map((command) => command.toJSON());

   if (guildCommands.length > 0) {
      console.log(`Loading ${guildCommands.length} commands`);

      try {
         rest.put(Routes.applicationGuildCommands(clientid, guildid), {
            body: guildCommands,
         });
      } catch (error) {
         console.error(error);
      }
   }
}

export function deregisterGuildCommands(
   clientid: string,
   guildid: string
): Promise<unknown> {
   return rest.put(Routes.applicationGuildCommands(clientid, guildid), {
      body: [],
   });
}

export async function* getFiles(
   dir: string
): AsyncGenerator<string, void, void> {
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
