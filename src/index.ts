import { Client, Intents, Collection } from 'discord.js';
import { handleInteraction } from './utils/helper_functions.config';
import {
   readCommands,
   registerGuildCommands,
} from './utils/register_commands.config';
import initDistube from './utils/distube.config';
import config from './utils/config';
import initMongoose from './utils/mongoose.config';
import initEventLoop from './utils/timer.config';
import guildServices from './services/guild.services';
import Command from './utils/common.commands.config';
import DisTube from 'distube';

export const client = new Client({
   intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_MESSAGES,
   ],
}); // initialize client

export let commands: Collection<string, Command>;

export const distube = initDistube(
   new DisTube(client, {
      emitNewSongOnly: true,
      youtubeDL: false,
   })
);

// load commands
(async () => {
   commands = await readCommands('dist/commands');
})();

// log that bot is running
client.once('ready', async () => {
   client.user?.setPresence({
      status: 'online',
      activities: [
         {
            name: config.botStatus,
            type: 'PLAYING',
         },
      ],
   });

   initEventLoop();

   console.log(`[server] loaded ${commands.size} commands`);
});

// runs for each interaction
client.on('interactionCreate', handleInteraction);

client.on('messageCreate', async (message) => {
   if (
      message.channelId === '310489953157120023' &&
      message.content.startsWith('!ban')
   ) {
      const user = message.mentions.members?.first();

      if (user) {
         await message.channel.send(
            `Successfully banned user ${user.toString()}`
         );

         setTimeout(() => {
            message.channel.send('Just Kidding :smile:');
         }, 3000);
      }
   }
});

client.on('error', (error) => {
   console.error(error.message);
});

client.on('guildCreate', (guild) => {
   if (!config.clientId) {
      console.error(
         'ERROR: Failed to register Guild Commands: Client ID not provided'
      );
      return;
   }

   guildServices
      .CreateGuild(guild)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .then(() => registerGuildCommands(config.clientId!, guild.id, commands))
      .then(() => {
         console.log(`Joined new guild ${guild.name}`);
         console.log('Sucessfully Registered commands');
      })
      .catch(console.error);
});

client.on('guildDelete', (guild) => {
   guildServices
      .DeleteGuild(guild.id)
      .then(() => {
         console.log(`Left Guild ${guild.name}`);
      })
      .catch(console.error);
});

initMongoose();

client.login(config.token);
