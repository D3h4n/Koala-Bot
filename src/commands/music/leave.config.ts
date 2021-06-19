import Command from '../common.commands.config';
import { Message } from 'discord.js';
import { client } from '../../index';

export default class leaveCommand extends Command {
  constructor() {
    super('Leave', 'leave', ['Leave voice channel', 'Usage: $leave']);
  }

  action(message: Message) {
    let voice = client.voice?.connections.first();

    if (!voice?.channel.id) {
      message.channel.send("`I'm not in a voice channel`");
      return;
    }

    voice?.disconnect();
  }
}
