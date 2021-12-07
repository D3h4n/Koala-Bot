import Command from '../../utils/common.commands.config';
import { CommandInteraction, GuildMember } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';

export default class joinCommand extends Command {
  constructor() {
    super('join', 'Add bot to voice channel');
  }

  async action(interaction: CommandInteraction) {
    // get voice channel of member
    const channel = (interaction.member! as GuildMember).voice.channel;

    if (channel?.joinable) {
      try {
        joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guildId,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });

        interaction.reply(`Joined channel ${channel.name}`);
      } catch (error) {
        interaction.reply('`Error joining voice channel`');
        console.error(error);
      }
    }
  }
}
