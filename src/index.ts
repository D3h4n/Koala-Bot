import {
  ActivityType,
  Client,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import { handleInteraction } from "./utils/helper_functions.config";
import {
  deregisterApplicationCommands,
  deregisterGuildCommands,
  readCommands,
  registerApplicationCommands,
  registerGuildCommands,
} from "./utils/register_commands.config";
import initDistube from "./utils/distube.config";
import config from "./utils/config";
import initMongoose from "./utils/mongoose.config";
import initEventLoop from "./utils/timer.config";
import guildServices from "./services/guild.services";
import Command from "./utils/common.commands.config";
import DisTube from "distube";

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
  ],
}); // initialize client

export let commands: Collection<string, Command>;

export const distube = initDistube(
  new DisTube(client, {
    emitNewSongOnly: true,
    leaveOnEmpty: true,
  }),
);

// load commands
(async () => {
  commands = await readCommands("dist/commands");

  if (config.registerCommands && config.clientId) {
    await deregisterApplicationCommands(config.clientId);
    await registerApplicationCommands(
      config.clientId,
      commands,
      // .filter((command) =>
      //   ["echo", "choose", "play", "stop", "queue", "remove"].includes(
      //     command.name,
      //   )
      // ),
    );
    process.exit();
  }
})();

// log that bot is running
client.once("ready", async () => {
  client.user?.setPresence({
    status: "online",
    activities: [
      {
        name: config.botStatus,
        type: ActivityType.Playing,
      },
    ],
  });

  initEventLoop();

  console.log(`[server] loaded ${commands.size} commands`);
});

// runs for each interaction
client.on("interactionCreate", handleInteraction);

client.on("error", (error) => {
  console.error(error.message);
});

client.on("guildCreate", (guild) => {
  if (!config.clientId) {
    console.error(
      "ERROR: Failed to register Guild Commands: Client ID not provided",
    );
    return;
  }

  guildServices
    .CreateGuild(guild)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then(() => registerGuildCommands(config.clientId!, guild.id, commands))
    .then(() => {
      console.log(`Joined new guild ${guild.name}`);
      console.log("Sucessfully Registered commands");
    })
    .catch(console.error);
});

client.on("guildDelete", (guild) => {
  guildServices
    .DeleteGuild(guild.id)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .then(() => deregisterGuildCommands(config.clientId!, guild.id))
    .then(() => {
      console.log(`Left Guild ${guild.name}`);
    })
    .catch(console.error);
});

initMongoose();

client.login(config.token);
