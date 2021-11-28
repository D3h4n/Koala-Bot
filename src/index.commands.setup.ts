import Discord from 'discord.js';
import Command from './common.commands.config';
import {promises} from 'fs';
import {resolve} from 'path';


async function* getFiles(dir: string): AsyncGenerator<string, void, void> {
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

// create a map of commands
let commands = new Discord.Collection<string, Command>();

(async () => {
  for await (const f of getFiles("dist/commands")) {
    if (f.endsWith(".js")) {
      const command = require(f).default;

      const instance: Command = new command();

      commands.set(instance.commandName, instance);
    }
  }
})().then(() => {
  commands.forEach((command) => {
    command.aliases?.forEach((alias) => {
      commandAliasesMap.set(alias, command.commandName);
    });
  });
})

export default commands;

const commandAliasesMap = new Map<string, string>();


export const commandAliases = (() => commandAliasesMap)();
