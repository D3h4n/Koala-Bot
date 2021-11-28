import { CommandInteraction } from 'discord.js';
import Command from '../../common.commands.config';

export default class chooseCommand extends Command {
  constructor() {
    super(
      'choose',
      'Let the bot decide your fate',
    );

    this.addStringOption(option =>(
      option.setName('option1').setDescription('The first option to choose from').setRequired(true)
    ));

    this.addStringOption(option => (
      option.setName('option2').setDescription('The second option to choose from').setRequired(true)
    ));

    for (let i = 3; i <= 9; i++) {
      this.addStringOption(option => (
        option.setName(`option${i}`).setDescription('An option to choose from').setRequired(false)
      ));
    }
  }

  action(interaction: CommandInteraction) {
    // generate random result
    let options = interaction.options.data.map(a => a.value);

    console.log(options);
    
    const result = options[Math.floor(Math.random() * options.length)];

    // return result
    return interaction.reply(result?.toString()!);
  }
}
