import Command from '../../utils/common.commands.config';
import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';

export default class shuffleCommand extends Command {
   constructor() {
      super('shuffle', 'Shuffle the queue');
   }

   action(interaction: CommandInteraction): void {
      try {
         distube.shuffle(interaction);
      } catch (error) {
         interaction.reply('`Error shuffling queue`');
         console.error(error);
         return;
      }

      interaction.reply('`Shuffled Queue`');
   }
}
