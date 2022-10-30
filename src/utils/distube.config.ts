import { EmbedBuilder } from "discord.js";
import DisTube from "distube";
import config from "./config";

export default function (distube: DisTube): DisTube {
  const { mainColor, msgTimeout } = config;

  // distube setup
  distube.on("initQueue", (queue) => {
    queue.autoplay = false;
    queue.volume = 100;
  });

  distube.on("playSong", (queue, song) => {
    if (queue.repeatMode === 1) return;

    const res = new EmbedBuilder();

    const desc = `[${song.name}](${song.url})\n` +
      `Length: ${song.formattedDuration}`;

    res.setColor(mainColor)
      .setTitle("Now playing")
      .setAuthor({
        name: song.member?.displayName ?? "No Display Name",
        iconURL: song.user?.displayAvatarURL(),
      })
      .setThumbnail(song.thumbnail ?? "")
      .setDescription(desc);

    queue.textChannel
      ?.send({ embeds: [res] })
      .then((msg) =>
        setTimeout(() => msg.delete().catch(console.error), msgTimeout)
      );
  });

  distube.on("addSong", (queue, song) => {
    if (queue.songs.length === 1) return;

    const res = new EmbedBuilder();

    const desc = `[${song.name}](${song.url})\n` +
      `Length: ${song.formattedDuration}\n` +
      `Position in Queue: ${queue.songs.findIndex((val) => val === song)}`;

    res.setColor(mainColor)
      .setTitle("Added to Queue")
      .setDescription(desc)
      .setThumbnail(song.thumbnail ?? "")
      .setAuthor({
        name: song.member?.displayName ?? "No Display Name",
        iconURL: song.user?.displayAvatarURL(),
      });

    queue.textChannel
      ?.send({ embeds: [res] })
      .then((msg) =>
        setTimeout(() => msg.delete().catch(console.error), msgTimeout)
      );
  });

  distube.on("addList", (queue, playlist) => {
    try {
      const res = new EmbedBuilder();

      const desc =
        `[${playlist.name}](${playlist.url})\n and \`${
          playlist.songs.length - 1
        } others\`\n` + `Length: ${playlist.formattedDuration}\n`;

      res.setColor(mainColor)
        .setTitle("Added Playlist to Queue")
        .setDescription(desc)
        .setThumbnail(playlist.thumbnail ?? "")
        .setAuthor({
          name: playlist.member?.displayName ?? "No Display Name",
          iconURL: playlist.user?.displayAvatarURL(),
        });

      queue.textChannel
        ?.send({ embeds: [res] })
        .then((msg) =>
          setTimeout(() => msg.delete().catch(console.error), msgTimeout)
        );
    } catch (error) {
      console.error(error);
    }
  });

  distube.on("error", (channel, error) => {
    console.error(error);
    channel?.send("`ERROR: " + error.message + "`");
  });

  return distube;
}
