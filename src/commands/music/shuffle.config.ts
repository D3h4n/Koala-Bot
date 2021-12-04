import Command from '../../utils/common.commands.config';
import { CommandInteraction } from 'discord.js';
import { distube } from '../../index';

export default class shuffleCommand extends Command {
  constructor() {
    super('shuffle', 'Shuffle the queue');
  }

  action(interaction: CommandInteraction) {
    try {
      distube.shuffle(interaction);
    } catch (error) {
      console.error(error);
      return interaction.reply('`Error shuffling queue`');
    }

    return interaction.reply('`Shuffled Queue`');
  }
}
