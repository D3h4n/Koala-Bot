import { Message } from 'discord.js';
import Command from '../common.commands.config';
import economyServices from './economy.services';

export default class betCommand extends Command {
  constructor() {
    super('bet', [
      'Guess a number between 1 and 5 to win money',
      'Usage: $bet <amount> <guess>',
    ]);
  }

  async action({ author, channel }: Message, args: string[]) {
    const betAmount = Number(args[1]);

    if (Number.isNaN(betAmount) || betAmount < 1) {
      channel.send(`\`$${betAmount}\` is not a valid amount`);
      return;
    }

    const record = await economyServices.getUserByDiscord(author.id);

    if (!record) {
      channel.send('`You have no money. Try collecting your daily first`');
      return;
    }

    if (record.balance < betAmount) {
      channel.send(
        `You only have \`$${record.balance}\`. Get you're money up.`
      );
      return;
    }

    const guess = Number(args[2]);

    if (Number.isNaN(guess) || guess < 1 || guess > 5) {
      channel.send(`\`$${guess}\` is not a valid amount`);
      return;
    }

    const result = Math.floor(Math.random() * 5) + 1;

    channel.send(`\`Result: ${result}\``);
    if (result === guess) {
      record.balance += betAmount * 4;
      channel.send(`You win \`$${betAmount * 5}\`!!!`);
    } else {
      record.balance -= betAmount;
      channel.send('You Lose. :pensive:');
    }

    record.save();
  }
}
