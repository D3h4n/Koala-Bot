import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import config from '../../utils/config';
import Command from '../../utils/common.commands.config';

export default class rngCommand extends Command {
   constructor() {
      super('rng', 'Generate a random number');

      this.addNumberOption((option) =>
         option.setName('max').setDescription('Highest number')
      );

      this.addNumberOption((option) =>
         option.setName('min').setDescription('Lowest number')
      );

      this.addNumberOption((option) =>
         option.setName('count').setDescription('Amount of numbers to generate')
      );
   }

   action(interaction: CommandInteraction): void {
      let max = interaction.options.getNumber('max') ?? 10;
      let min = interaction.options.getNumber('min') ?? 1;
      const count = interaction.options.getNumber('count') ?? 1;

      // swap min and max if min is larger than max
      if (min > max) {
         const temp = min;
         min = max;
         max = temp;
      }

      // assert count is greater than 0
      if (count < 1) {
         interaction.reply('`Count is too small`');
         return;
      }

      // assert count is less than maxRandomNumbers
      if (count > config.maxRandomNumbers) {
         interaction.reply('`Count is too big`');
         return;
      }

      // generate array of random numbers
      const numbers: number[] = [];

      for (let i = 0; i < count; i++) {
         numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
      }

      if (count > 1) {
         // create embedded message response for more than 1 number
         const response = new MessageEmbed({
            title: 'Random Numbers',
            author: {
               name: (interaction.member as GuildMember)?.displayName,
               iconURL: interaction.user.displayAvatarURL(),
            },
            description: ['**Results**', ...numbers].join(' '),
            color: config.mainColor,
         });

         interaction.reply({
            embeds: [response],
         });
         return;
      }

      interaction.reply(`\`${numbers[0]}\``);
      return;
   }
}
