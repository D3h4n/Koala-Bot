import { Client, Intents, Collection } from 'discord.js';
import { handleInteraction, updateGuildCommandPermissions } from './utils/helper.functions';
import config from './utils/config';
import initMongoose from './utils/mongoose.config';
import initEventLoop from './utils/timer.config';
import guildServices from './services/guild.services';
import Command from './utils/common.commands.config';
import { readCommands, registerGuildCommands } from './utils/registerCommands';
import { initDistube } from './utils/distube.config';

export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] }); // initialize client

export let commands: Collection<string, Command>;

export const distube = initDistube(client);

(async () => {
  commands = await readCommands("dist/commands")

  // await deregisterApplicationCommands(config.clientId!);
  // await registerApplicationCommands(config.clientId!, commands);
})();

// log that bot is running
client.once('ready', async () => {
  client.user!.setPresence({
    status: 'online',
    activities: [{
      name: config.botStatus,
      type: 'PLAYING' 
    }]
  });
  
  initEventLoop();

  console.log(`[server] loaded ${commands.size} commands`);
});

// runs for each interaction
client.on('interactionCreate', handleInteraction);

client.on('error', (error) => {
  console.error(error.message);
})

client.on('guildCreate', (guild) => {
  guildServices.CreateGuild(guild)
    .then(() => registerGuildCommands(config.clientId!, guild.id, commands))
    .then(() => updateGuildCommandPermissions(guild.id, commands))
    .then(() => {
      console.log(`Joined new guild ${guild.name}`);
      console.log('Sucessfully Registered commands');
    })
    .catch(console.error);
});

client.on('guildDelete', (guild) => {
  guildServices.DeleteGuild(guild.id)
    .then(() => {
      console.log(`Left Guild ${guild.name}`);
    })
    .catch(console.error);
});

initMongoose();
  
client.login(config.token);

