import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class purgeCommand extends Command {
  constructor() {
    super(
      'Purge',
      'purge',
      ['Remove all messages from a chat', '$Usage: $purge <chat name>'],
      [],
      ['MANAGE_MESSAGES']
    );
  }

  action(message: Message, args: string[]) {
    const channelName = args.slice(1).join(' ');

    const channel = message.guild?.channels.cache.get(message.channel.id);

    if (channel?.name !== channelName) {
      message.channel.send(`\`To confirm type "$purge ${channel?.name}"\``);
      return;
    }

    channel
      .clone()
      .then((newChannel) => {
        if (newChannel.isText()) {
          newChannel.send('`Channel Succesfully Purged`');
        }
      })
      .catch(console.error);

    channel.delete();
  }
}
