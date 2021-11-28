import { Message, MessageEmbed } from 'discord.js';
import Command from '../../common.commands.config';

export default class yeetCommand extends Command {
  constructor() {
    super(
      'Yeet',
      'yeet',
      [
        'Move a bunch of people between voice channels',
        'NB:// You have to be in the voice channel',
        'Usage: $yeet <new voice channel>',
      ],
      [],
      ['MOVE_MEMBERS']
    );
  }

  action({ member, guild, channel }: Message, args: string[]) {
    const voiceChannel = member?.voice.channel; // connected voice channel

    // get channel name
    const channelName = args.slice(1).join(' ');

    // check if user is in a voice channel
    if (!voiceChannel) {
      channel.send('`Gotta be in a channel buddy`');
      return;
    }

    // find the new channel
    const newChannel = guild?.channels.cache.find(
      ({ type, name }) => type === 'voice' && name === channelName
    );

    // check if channel was found
    if (!newChannel) {
      channel.send('`Could not find that channel`');
      return;
    }

    // move each connected member to new channel
    voiceChannel?.members.forEach((member) =>
      member.voice.setChannel(newChannel)
    );

    // create and send response
    const response = new MessageEmbed();

    response
      .setTitle(`Yote from "${voiceChannel.name}" to "${newChannel.name}"`)
      .setDescription(
        voiceChannel.members
          .array()
          .map((member, idx) => `${idx + 1}. ${member.displayName}`)
      );

    channel.send(response);
  }
}
