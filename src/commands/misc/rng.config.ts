import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import config from '../../utils/config';
import Command from '../../common.commands.config';

export default class rngCommand extends Command {
  constructor() {
    super(
      'rng', 
      'Generate a random number',
    );

    this.addNumberOption(option=> (
      option.setName('max').setDescription('Highest number')
    ));

    this.addNumberOption(option=> (
      option.setName('min').setDescription('Lowest number')
    ));
    
    this.addNumberOption(option=> (
      option.setName('count').setDescription('Amount of numbers to generate')
    ));
  }

  action(interaction: CommandInteraction) {
    let max: number = interaction.options.getNumber('max') ?? 10;
    let min: number = interaction.options.getNumber('min') ?? 1;
    let count: number = interaction.options.getNumber('count') ?? 1;

    // swap min and max if min is larger than max
    if (min > max) {
      let temp = min;
      min = max;
      max = temp;
    }

    // assert count is greater than 0
    if (count < 1) {
      return interaction.reply('`Count is too small`');
    }

    // assert count is less than maxRandomNumbers
    if (count > config.maxRandomNumbers) {
      return interaction.reply('`Count is too big`');
    }

    // generate array of random numbers
    let numbers: number[] = [];

    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    if (count > 1) {
      // create embedded message response for more than 1 number
      let response = new MessageEmbed();

      response
        .setTitle('Random Numbers')
        .setAuthor(
          (interaction.member as GuildMember)?.displayName,
          interaction.user.displayAvatarURL()
        )
        .setDescription(['**Results:**', ...numbers].join(' '))
        .setColor(config.mainColor);
      
      interaction.reply({
        embeds: [response]
      });
      return; 
    }

    return interaction.reply(`\`${numbers[0]}\``);
  }
}
