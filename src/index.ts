import { Client, Message } from "discord.js";
import config from "./config";

import commands from "./commands/index.commands.setup";

const { token, prefix } = config; // config info for bot

const client = new Client(); // initialize client
// functions

const logCommand = (message: Message) => {
  let channel = message.guild?.channels.resolve(message.channel.id);

  console.log(
    `User: ${message.author.tag} Channel: ${channel?.name} Command: ${message.content}`
  );
};

// log that bot is running
client.once("ready", () => {
  console.log(`Loaded ${commands().size} commands`);
  commands().forEach((command) => {
    console.log(prefix + command.commandName);
  });

  console.log("\nReady to Go!\n");
  client.user!.setPresence({
    status: "online",
    activity: {
      name: "try $commands",
      type: "PLAYING",
    },
  });
});

client.on("message", (message) => {
  if (
    // check for valid message
    message.content.startsWith(prefix) &&
    !message.author.bot &&
    message.author !== client.user
  ) {
    // parse message
    let args = message.content.slice(prefix.length).trim().split(/ +/);
    let commandName = args[0].toLowerCase();

    // check for the correct command and execute it
    if (commands().has(commandName)) {
      commands().get(commandName)!.action(message, args);
      logCommand(message);
      return;
    }

    // send message if command isn't found
    message.channel.send(`That command was not found`);
    return;
  }
});

client.login(token);
