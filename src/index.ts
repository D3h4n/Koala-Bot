import { Client, TextChannel, Intents } from 'discord.js';
import { registerGuildCommands, readCommands, handleInteraction } from './helper.functions';
// import { registerApplicationCommands, updateGuildCommandPermission } from './helper.functions;
import config from './utils/config';
import initMongoose from './utils/mongoose.config';
import initEventLoop from './utils/timer.config';
import guildServices from './services/guild.services';

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] }); // initialize client

(async () => await readCommands("dist/commands"))();

// log that bot is running
client.once('ready', async () => {
  // await registerApplicationCommands(client.user!.id);
  // await guildServices
  //   .GetGuilds()
  //   .then(guilds => {
  //     guilds.forEach(guild => {
  //       updateGuildCommandPermissions(guild.guildId);
  //     })
  //   })
  //   .catch(console.error);


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

client.on('guildCreate', (guild) => {
  guildServices.CreateGuild(guild)
    .then(() => registerGuildCommands(client.user?.id!, guild.id))
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
