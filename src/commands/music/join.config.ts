import Command from '../common.commands.config';
import { Message } from 'discord.js';

export default class joinCommand extends Command {
  constructor() {
    super('Join', 'join', ['Add bot to voice channel', 'Usage: $join'], ['j']);
  }

  action(message: Message) {
    const { voice } = message.member!;

    try {
      voice.channel
        ?.join()
        .then((voiceConnection) =>
          message.channel.send(
            `Joined channel ${voiceConnection.channel.toString()}`
          )
        );
    } catch (err) {
      message.channel.send('`Error joining voice channel`');
    }
  }
}
