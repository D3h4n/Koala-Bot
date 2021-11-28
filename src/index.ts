import { Client, TextChannel, Intents } from 'discord.js';
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import config from './utils/config';
import initMongoose from './utils/mongoose.config';
import initEventLoop from './utils/timer.config';
import {getFiles} from './helper.functions';
import guildServices from './services/guild.services';
import Command from './common.commands.config';

export const client = new Client({ intents: [Intents.FLAGS.GUILDS]}); // initialize client

// create a map of commands
const commands: Map<string, Command> = new Map<string, Command>();

(async () => {
  for await (const f of getFiles("dist/commands")) {
    if (f.endsWith(".js")) {
      const command: Command = new (require(f).default)();
      
      commands.set(command.name, command);
    }
  }
})();

// log that bot is running
client.once('ready', () => {
  const rest = new REST({version: "9"}).setToken(config.token!);

  rest.put(
    Routes.applicationGuildCommands(client.user!.id, '310489953157120023'), 
    {
      body: [...commands.values()].map(command => command.toJSON())
    }
  ).then(() => console.log(`Loaded ${commands.size} commands`)).catch(console.error);
  
  client.user!.setPresence({
    status: 'online',
    activities: [
      {
        name: "gaming",
        type: 'COMPETING'
      }
    ]
  });
  
  if (config.onlineMessage) {
    const channel = client.guilds
    .resolve('310489953157120023')
    ?.channels.resolve('310489953157120023') as TextChannel;
    
    channel.send("Hello! I'm online now. 😊");
  }
  
  initEventLoop();
});

// runs for each interaction
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  let command = commands.get(interaction.commandName);

  command?.action(interaction);
});

client.on('guildCreate', (guild) => {
  console.log(`Joined new guild ${guild.name}`);
  guildServices.CreateGuild(guild).catch(console.error);
});

client.on('guildDelete', (guild) => {
  console.log(`Left Guild ${guild.name}`);
  guildServices.DeleteGuild(guild.id).catch(console.error);
});

initMongoose();
  
client.login(config.token);
