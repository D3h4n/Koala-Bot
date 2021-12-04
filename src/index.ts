import { Client, TextChannel, Intents, Collection } from 'discord.js';
import { handleInteraction } from './utils/helper.functions';
import config from './utils/config';
import initMongoose from './utils/mongoose.config';
import initEventLoop from './utils/timer.config';
import guildServices from './services/guild.services';
import Command from './utils/common.commands.config';
import { readCommands, registerGuildCommands } from './utils/registerCommands';
import { initDistube } from './utils/distube.config';
// import { registerApplicationCommands } from './utils/registerCommands';

export const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] }); // initialize client

export let commands: Collection<string, Command>;

export const distube = initDistube(client);

(async () => {
  commands = await readCommands("dist/commands")

  // await deregisterApplicationCommands(config.clientId!);
  // await registerApplicationCommands(config.clientId!, commands);

  // await guildServices
  //   .GetGuilds()
  //   .then(guilds => {
  //     guilds.forEach(guild => {
  //       updateGuildCommandPermissions(guild.guildId, commands);
  //     })
  //   })
  //   .catch(console.error);
  // await registerGuildCommands(client.user!.id, '310489953157120023', commands);
  // await updateGuildCommandPermissions('310489953157120023', commands);
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
  
  if (config.onlineMessage) {
    const channel = client.guilds
    .resolve('310489953157120023')
    ?.channels.resolve('310489953157120023') as TextChannel;
    
    channel.send("Hello! I'm online now. 😊");
  }
  
  initEventLoop();

  console.log('Up and Running!!!');
});

// runs for each interaction
client.on('interactionCreate', handleInteraction);

client.on('error', (error) => {
  console.error(error.message);
})

client.on('guildCreate', (guild) => {
  guildServices.CreateGuild(guild)
    .then(() => registerGuildCommands(client.user?.id!, guild.id, commands))
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

