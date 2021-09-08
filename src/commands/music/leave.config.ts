import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { client } from '../../index';

export default class leaveCommand extends Command {
  constructor() {
    super('Leave', 'leave', ['Leave voice channel', 'Usage: $leave']);
  }

  action(message: Message) {
    // get voice connection
    let voice = client.voice?.connections.first();

    // check if bot is connected to a channel
    if (!voice?.channel.id) {
      message.channel.send("`I'm not in a voice channel`");
      return;
    }

    // disconnect bot
    voice?.disconnect();
  }
}
