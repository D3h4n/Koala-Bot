import { Client } from 'discord.js';
import Distube from 'distube'

export function initDistube(client: Client) {
   let distube = new Distube(client);

   distube.on("initQueue", (queue) => {
      queue.textChannel?.send('`playing`');
   })

   distube.on("addSong", (queue, song) => {
      queue.textChannel?.send(`Now playing: ${song.name}`);
   })

   distube.on("error", (channel, error) => {
      channel.send(error.message);
   })

   return distube;
}
