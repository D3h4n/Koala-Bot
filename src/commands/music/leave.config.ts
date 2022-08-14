import Command from '../../utils/common.commands.config';
import { ChatInputCommandInteraction } from 'discord.js';
import { distube } from '../../index';

export default class leaveCommand extends Command {
   constructor() {
      super('leave', 'Leave voice channel');
   }

   action(interaction: ChatInputCommandInteraction): void {
      // disconnect bot
      distube.voices.leave(interaction);
      interaction.reply('`Left voice channel`');
   }
}
