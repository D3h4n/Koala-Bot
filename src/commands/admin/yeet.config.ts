import {
   CommandInteraction,
   GuildMember,
   MessageEmbed,
   VoiceChannel,
} from 'discord.js';
import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import Command from '../../utils/common.commands.config';
import config from '../../utils/config';

export default class yeetCommand extends Command {
   constructor() {
      super(
         'yeet',
         'Move a bunch of people between voice channels',
         PermissionFlagsBits.MoveMembers
      );

      this.addChannelOption((option) =>
         option
            .setName('channel')
            .setDescription('Channel to yeet to')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
      );
   }

   async action(interaction: CommandInteraction) {
      const member = interaction.member as GuildMember;

      const voiceChannel = member.voice?.channel;

      // check if user is in a voice channel
      if (!voiceChannel || !voiceChannel.isVoice()) {
         interaction.reply('`Gotta be in a channel buddy`');
         return;
      }

      // get channel name
      const newChannel = interaction.options.getChannel(
         'channel',
         true
      ) as VoiceChannel;

      // move each connected member to new channel
      voiceChannel?.members.forEach(
         async (member) =>
            await member.voice.setChannel(newChannel).catch(console.error)
      );

      let count = 0;

      // create and send response
      const response = new MessageEmbed();

      response
         .setTitle(`Yote from "${voiceChannel.name}" to "${newChannel.name}"`)
         .setColor(config.mainColor)
         .setDescription(
            voiceChannel.members
               .map((member) => `${++count}. ${member.displayName}`)
               .join('\n')
         );

      interaction.reply({
         embeds: [response],
      });

      setTimeout(() => {
         interaction.deleteReply();
      }, config.msgTimeout);
   }
}
