import { CommandInteraction, GuildMember, MessageEmbed, VoiceChannel } from 'discord.js';
import {ChannelType} from 'discord-api-types/v9'
import Command from '../../common.commands.config';

export default class yeetCommand extends Command {
  constructor() {
    super(
      'yeet',
      'Move a bunch of people between voice channels',
      [
        {
          id: '829531557785894923',
          type: 'ROLE',
          permission: true
        }
      ]
    );

    this.addChannelOption(option => (
      option.setName('channel').setDescription('Channel to yeet to').setRequired(true).addChannelType(ChannelType.GuildVoice)
    ))
  }

  action(interaction: CommandInteraction) {
    const member = interaction.member as GuildMember; // connected voice channel

    const voiceChannel = member.voice.channel;

    // get channel name
    const newChannel = interaction.options.getChannel('channel') as VoiceChannel;

    // check if user is in a voice channel
    if (!voiceChannel) {
      interaction.reply('`Gotta be in a channel buddy`');
      return;
    }

    // check if channel was found
    if (!newChannel) {
      interaction.reply('`Could not find that channel`');
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
        voiceChannel.members.map((member, idx) => `${idx + 1}. ${member.displayName}`).join('\n')
      );

    interaction.reply("Did the thing");
  }
}
