import { MessageEmbed } from 'discord.js';
import DisTube from 'distube';
import { client } from './index';
import config from './config';

export default function (distube: DisTube) {
  const { mainColor, msgTimeout } = config;

  // distube setup
  distube.on('initQueue', (queue) => {
    client.voice?.connections.forEach((connection) => {
      connection.voice?.setSelfDeaf(true).catch(console.error);
    });
    queue.autoplay = false;
    queue.volume = 100;
  });

  distube.on('playSong', (message, _, song) => {
    let res = new MessageEmbed();

    let desc =
      `[${song.name}](${song.url})\n` + `Length: ${song.formattedDuration}`;

    res
      .setColor(mainColor)
      .setTitle('Now playing')
      .setAuthor(song.user.username, song.user.displayAvatarURL())
      .setThumbnail(song.thumbnail!)
      .setDescription(desc);

    message.channel
      .send(res)
      .then((msg) => msg.delete({ timeout: song.duration * 1000 }));
  });

  distube.on('addSong', (message, queue, song) => {
    let res = new MessageEmbed();

    let desc =
      `[${song.name}](${song.url})\n` +
      `Length: ${song.formattedDuration}\n` +
      `Position in Queue: ${queue.songs.findIndex((val) => val === song)}`;

    res
      .setColor(mainColor)
      .setTitle('Added to Queue')
      .setDescription(desc)
      .setThumbnail(song.thumbnail!)
      .setAuthor(song.user.username, song.user.displayAvatarURL());

    message.channel
      .send(res)
      .then((msg) => msg.delete({ timeout: msgTimeout }));
  });

  distube.on('playList', (message, queue, playlist, song) => {
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
        .setColor(mainColor)
        .setTitle('Added Playlist to Queue')
        .setDescription(desc)
        .setThumbnail(song.thumbnail!)
        .setAuthor(song.user.username, song.user.displayAvatarURL());

      message.channel
        .send(res)
        .then((msg) => msg.delete({ timeout: msgTimeout }));
    } catch (error) {
      console.error(error);
    }
  });
}
