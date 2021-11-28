import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import Command from '../../common.commands.config';
import economyServices from '../../services/economy.services';

export default class dailyCommand extends Command {
  avgGain: number;
  randomRange: number;

  constructor() {
    super('daily', 'earn daily currency');

    this.avgGain = 100;
    this.randomRange = 20;
  }

  async action(interaction: CommandInteraction) {
    // get user record or create new record
    const user =
      (await economyServices.getUserByDiscord(interaction.user.id)) ??
      (await economyServices.createUser(interaction.user.id, interaction.user.username));

    // get today's date
    const today = new Date();

    // check last time user got daily
    if (user.nextDaily.valueOf() > today.valueOf()) {
      const remainingTime = Math.round(
        (user.nextDaily.valueOf() - today.valueOf()) / 60000
      );

      interaction.reply('Stop being greedy.');
      interaction.followUp(`You have to wait \`${this.generateTimeString(remainingTime)}\`.`);
      return;
    }

    // calculate daily gain
    const gain = this.generateGain();

    // update record
    user.balance += gain;
    user.nextDaily = new Date(today.valueOf() + 8.64e7);
    user.save();

    // send embedded message
    const response = new MessageEmbed();

    response
      .setAuthor((interaction.member as GuildMember)?.displayName, interaction.user.displayAvatarURL())
      .setDescription(`**Earned:** $${gain}\n**Balance:** $${user.balance}`);

    //TODO: Figure out reponse
    // interaction.reply(response); 
  }

  /**
   * Generate daily gain amount based on average
   * gain and some random fluctuation
   *
   * @returns daily gain amount
   */
  generateGain() {
    return (
      this.avgGain +
      (Math.floor(Math.random() * (this.randomRange + 1)) -
        this.randomRange / 2)
    );
  }

  generateTimeString(remainingTime: number) {
    const hours = Math.floor(remainingTime / 60); // calculate hours remaining
    const minutes = remainingTime % 60; // calculate minutes remaining

    // return string with appropraite labels
    if (hours > 0 && minutes > 0) {
      return `${hours} Hours and ${minutes} Minutes`;
    }

    if (hours > 0) {
      return `${hours} Hour${hours > 1 ? 's' : ''}`;
    }

    if (minutes > 0) {
      return `${minutes} Minute${minutes > 1 ? 's' : ''}`;
    }

    return 'Less than a minute';
  }
}
