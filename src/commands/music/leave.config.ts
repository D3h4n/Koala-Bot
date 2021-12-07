import Command from '../../utils/common.commands.config';
import { CommandInteraction } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

export default class leaveCommand extends Command {
  constructor() {
    super('leave', 'Leave voice channel');
  }

  action(interaction: CommandInteraction) {
    // get voice connection in guild
    let voice = getVoiceConnection(interaction.guild!.id);

    // check if bot is connected to a channel
    if (!voice) {
      interaction.reply("`I'm not in a voice channel`");
      return;
    }

    // disconnect bot
    voice.disconnect();
    interaction.reply('`Left voice channel`');
  }
}
