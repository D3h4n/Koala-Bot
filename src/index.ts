import { Client, Message, MessageEmbed } from "discord.js";
import Distube from "distube";
import config from "./config";

import commands from "./commands/index.commands.setup";

const { token, prefix, botStatus } = config; // config info for bot

// functions
const logCommand = (message: Message) => {
  let channel = message.guild?.channels.resolve(message.channel.id);

  console.log(
    `User: ${message.author.tag} Channel: ${channel?.name} Command: ${message.content}`
  );
};

export const client = new Client(); // initialize client

// log that bot is running
client.once("ready", () => {
  console.log(`Loaded ${commands.size} commands`);

  client.user!.setPresence({
    status: "online",
    activity: {
      name: botStatus,
      type: "PLAYING",
    },
  });
});

// runs every time a message is sent in the server
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
    if (commands.has(commandName)) {
      commands.get(commandName)!.action(message, args);
      logCommand(message);
      return;
    }

    // send message if command isn't found
    message.channel.send(`That command was not found`);
    return;
  }
});

export const distube = new Distube(client, {
  searchSongs: false,
  emitNewSongOnly: true,
});

// distube setup
distube.on("initQueue", (queue) => {
  queue.autoplay = false;
  queue.volume = 100;
});

distube.on("playSong", (message, _, song) => {
  let res = new MessageEmbed();

  let desc =
    `[${song.name}](${song.url})\n` + `Length: ${song.formattedDuration}`;

  res
    .setColor(config.mainColor)
    .setTitle("Now playing")
    .setAuthor(song.user.username, song.user.displayAvatarURL())
    .setThumbnail(song.thumbnail!)
    .setDescription(desc);

  message.channel
    .send(res)
    .then((msg) => msg.delete({ timeout: song.duration }));
});

distube.on("addSong", (message, queue, song) => {
  let res = new MessageEmbed();

  let desc =
    `[${song.name}](${song.url})\n` +
    `Length: ${song.formattedDuration}\n` +
    `Position in Queue: ${queue.songs.findIndex((val) => val === song)}`;

  res
    .setColor(config.mainColor)
    .setTitle("Added to Queue")
    .setDescription(desc)
    .setThumbnail(song.thumbnail!)
    .setAuthor(song.user.username, song.user.displayAvatarURL());

  message.channel
    .send(res)
    .then((msg) => msg.delete({ timeout: config.msgTimeout }));
});

distube.on("playList", (message, queue, playlist, song) => {
  try {
    let res = new MessageEmbed();

    let desc =
      `[${song.name}](${song.url})\n and \`${
        playlist.songs.length - 1
      } others\`\n` +
      `Length: ${playlist.formattedDuration}\n` +
      `Start Position in Queue: ${queue.songs.findIndex(
        (val) => val === song
      )}`;

    res
      .setColor(config.mainColor)
      .setTitle("Added Playlist to Queue")
      .setDescription(desc)
      .setThumbnail(song.thumbnail!)
      .setAuthor(song.user.username, song.user.displayAvatarURL());

    message.channel
      .send(res)
      .then((msg) => msg.delete({ timeout: config.msgTimeout }));
  } catch (error) {
    console.error(error);
  }
});

distube.on("noRelated", (message) =>
  message.channel.send("Can't find related video to play. Stop playing music.")
);

client.login(token);
