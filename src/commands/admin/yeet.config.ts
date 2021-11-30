import { CommandInteraction, MessageEmbed, VoiceChannel } from 'discord.js';
import {ChannelType} from 'discord-api-types/v9'
import Command from '../../common.commands.config';
import config from '../../utils/config';

export default class yeetCommand extends Command {
  constructor() {
    super(
      'yeet',
      'Move a bunch of people between voice channels',
      '310489953157120023',
      [
        {
          id: '829531557785894923',
          type: 'ROLE',
          permission: true
        }
      ]
    );

    this.setDefaultPermission(false);

    this.addChannelOption(option => (
      option.setName('channel').setDescription('Channel to yeet to').setRequired(true).addChannelType(ChannelType.GuildVoice)
    ))
  }

  async action(interaction: CommandInteraction) {
    const member = await interaction.guild?.members.fetch(interaction.user);

    const voiceChannel = member?.voice?.channel;
    
    // check if user is in a voice channel
    if (!voiceChannel) {
      interaction.reply('`Gotta be in a channel buddy`');
      return;
    }

    // get channel name
    const newChannel = interaction.options.getChannel('channel', true) as VoiceChannel;

    // move each connected member to new channel
    voiceChannel?.members.forEach(async (member) =>
      await member.voice.setChannel(newChannel).catch(console.error)
    );

    let count = 0;

    // create and send response
    const response = new MessageEmbed();

    response
      .setTitle(`Yote from "${voiceChannel.name}" to "${newChannel.name}"`)
      .setDescription(
        voiceChannel.members.map((member) => `${++count}. ${member.displayName}`).join('\n')
      );

    interaction.reply({
      embeds: [response]
    });

    setTimeout(() => {
      interaction.deleteReply();
    }, config.msgTimeout)
  }
}
