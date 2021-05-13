import { Message, MessageEmbed } from 'discord.js';
import Command from '../common.commands.config';
import economyServices from './economy.services';

export default class dailyCommand extends Command {
  avgGain: number;
  randomRange: number;

  constructor() {
    super('daily', ['earn daily currency', 'Usage: $daily']);

    this.avgGain = 100;
    this.randomRange = 20;
  }

  async action({ author, channel, member }: Message) {
    const user = await economyServices.getUser(author.id); // get user

    const today = new Date(); // get today's date

    // check last time user got daily
    if (user.nextDaily.valueOf() > today.valueOf()) {
      const remainingTime = Math.round(
        (user.nextDaily.valueOf() - today.valueOf()) / 60000
      );

      channel.send([
        'Stop being greedy.',
        `You have to wait \`${this.generateTimeString(remainingTime)}\`.`,
      ]);
      return;
    }

    const gain = this.generateGain(); // calculate daily gain

    // update record
    user.balance += gain;
    user.nextDaily = new Date(today.valueOf() + 8.64e7);
    user.save();

    // TODO: make this an embedded message
    const response = new MessageEmbed();

    response
      .setAuthor(member?.displayName, author.displayAvatarURL())
      .setDescription([
        `**Earned:** $${gain}`,
        `**Balance:** $${user.balance}`,
      ]);

    channel.send(response);
  }

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
