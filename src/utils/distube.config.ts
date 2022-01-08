import { MessageEmbed } from 'discord.js';
import DisTube from 'distube';
import config from './config';

export default function (distube: DisTube) {
   const { mainColor, msgTimeout } = config;

   // distube setup
   distube.on('initQueue', (queue) => {
      queue.autoplay = false;
      queue.volume = 100;
   });

   distube.on('playSong', (queue, song) => {
      if (queue.repeatMode === 1) return;

      let res = new MessageEmbed();

      let desc =
         `[${song.name}](${song.url})\n` + `Length: ${song.formattedDuration}`;

      res.setColor(mainColor)
         .setTitle('Now playing')
         .setAuthor(song.member?.displayName!, song.user?.displayAvatarURL())
         .setThumbnail(song.thumbnail!)
         .setDescription(desc);

      queue.textChannel
         ?.send({ embeds: [res] })
         .then((msg) =>
            setTimeout(() => msg.delete().catch(console.error), msgTimeout)
         );
   });

   distube.on('addSong', (queue, song) => {
      if (queue.songs.length === 1) return;

      let res = new MessageEmbed();

      let desc =
         `[${song.name}](${song.url})\n` +
         `Length: ${song.formattedDuration}\n` +
         `Position in Queue: ${queue.songs.findIndex((val) => val === song)}`;

      res.setColor(mainColor)
         .setTitle('Added to Queue')
         .setDescription(desc)
         .setThumbnail(song.thumbnail!)
         .setAuthor(song.member?.displayName!, song.user?.displayAvatarURL());

      queue.textChannel
         ?.send({ embeds: [res] })
         .then((msg) =>
            setTimeout(() => msg.delete().catch(console.error), msgTimeout)
         );
   });

   distube.on('addList', (queue, playlist) => {
      try {
         let res = new MessageEmbed();

         let desc =
            `[${playlist.name}](${playlist.url})\n and \`${
               playlist.songs.length - 1
            } others\`\n` + `Length: ${playlist.formattedDuration}\n`;

         res.setColor(mainColor)
            .setTitle('Added Playlist to Queue')
            .setDescription(desc)
            .setThumbnail(playlist.thumbnail!)
            .setAuthor(
               playlist.member?.displayName!,
               playlist.user?.displayAvatarURL()
            );

         queue.textChannel
            ?.send({ embeds: [res] })
            .then((msg) =>
               setTimeout(() => msg.delete().catch(console.error), msgTimeout)
            );
      } catch (error) {
         console.error(error);
      }
   });

   distube.on('error', (channel, error) => {
      channel.send(error.message);
   });

   return distube;
}
