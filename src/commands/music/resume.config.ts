import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';
import Command from '../../utils/common.commands.config';

export default class resumeCommand extends Command {
   constructor() {
      super('resume', 'Resume the queue');
   }

   async action(interaction: CommandInteraction) {
      await interaction.deferReply();
      let queue = distube.getQueue(interaction);

      if (!queue || queue?.playing) {
         interaction.deleteReply();
         return;
      }

      queue.resume();
      interaction.editReply('`Resuming song`');
   }
}
