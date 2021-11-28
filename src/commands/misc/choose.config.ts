import { CommandInteraction } from 'discord.js';
import Command from '../../common.commands.config';

export default class chooseCommand extends Command {
  constructor() {
    super(
      'choose',
      'Let the bot decide your fate',
    );
  }

  action(interaction: CommandInteraction) {
    // check if there are any args
    if (interaction.options.data.length === 1) {
      return interaction.reply('`There is nothing to choose!`');
    }

    // generate random result
    let result = interaction.options.data[Math.floor(Math.random() * (interaction.options.data.length - 1)) + 1].value;

    // return result
    return interaction.reply(result?.toString()!);
  }
}
