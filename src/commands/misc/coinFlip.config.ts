import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import Command from '../../common.commands.config';
import config from '../../utils/config';

export default class coinFlipCommand extends Command {
  constructor() {
    super(
      'coinflip', 
      'Flip one or more coins'
    );
      
    this.addNumberOption(option=> 
      option.setName('amount').setDescription('Amount of coins to flip')
    )
  }

  action(interaction: CommandInteraction) {
    // set default values
    let flips: string[] = [];
    let times = interaction.options.getNumber('amount') ?? 1;

    // generate results of flips
    for (let i = 0; i < times; i++) {
      flips.push(Math.round(Math.random()) ? 'Heads' : 'Tails');
    }

    // if more than one flip
    if (times > 1) {
      // generate and send message embed of flips
      let response = new MessageEmbed();

      response
        .setTitle('Coin Flips')
        .setDescription(['**Results:**', ...flips].join(''))
        .setColor(config.mainColor)
        .setAuthor(
          (interaction.member as GuildMember)?.displayName,
          interaction.user.displayAvatarURL()
        );
        
      interaction.reply({
        embeds: [response]
      });
      return;
    }

    // return one flip
    return interaction.reply(`\`${flips[0]}\``);
  }
}
