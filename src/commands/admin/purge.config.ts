import { Message, NewsChannel, TextChannel } from 'discord.js';
import config from '../../utils/config';
import Command from '../../common.commands.config';

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

  async action(message: Message, args: string[]) {
    // get channel name
    const channelName = args.slice(1).join(' ');

    // get channel
    const channel = message.guild?.channels.cache.get(message.channel.id);

    // check if channel names match
    if (channel?.name !== channelName) {
      message.channel.send(`\`To confirm type "$purge ${channel?.name}"\``);
      return;
    }

    // clone old channel
    let newChannel = (await channel.clone().catch(console.error)) as
      | TextChannel
      | NewsChannel;

    // delete old channel
    await channel.delete().catch(console.error);
    let msg = await newChannel.send('`Channel Succesfully Purged`');

    await msg.delete({ timeout: config.msgTimeout * 2 });
  }
}
