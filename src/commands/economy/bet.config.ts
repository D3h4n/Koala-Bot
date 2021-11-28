import { Message } from 'discord.js';
import Command from '../../common.commands.config';
import economyServices from '../../services/economy.services';

export default class betCommand extends Command {
  constructor() {
    super('Bet', 'bet', [
      'Guess a number between 1 and 5 to win money',
      'Usage: $bet <amount> <guess>',
    ]);
  }

  async action({ author, channel }: Message, args: string[]) {
    // get the bet amount
    const betAmount = Number(args[1]);

    // assert that bet amount is a valid number
    if (Number.isNaN(betAmount) || betAmount < 1) {
      return channel.send(`\`${args[1]}\` is not a valid amount`);
    }

    // get user record
    const record = await economyServices.getUserByDiscord(author.id);

    // assert that user has a record
    if (!record) {
      return channel.send(
        '`You have no money. Try collecting your daily first`'
      );
    }

    // check if user has enough balance for bet
    if (record.balance < betAmount) {
      return channel.send(
        `You only have \`$${record.balance}\`. Get you're money up.`
      );
    }

    // get guess
    const guess = Number(args[2]);

    // assert a valid guess
    if (Number.isNaN(guess) || guess < 1 || guess > 5) {
      return channel.send(`\`${args[2]}\` is not a valid amount`);
    }

    // generate random number
    const result = Math.floor(Math.random() * 5) + 1;

    // send result to channel
    channel.send(`\`Result: ${result}\``);

    // if user guesses correctly, add earnings to balance
    if (result === guess) {
      record.balance += betAmount * 4;
      record.save();
      return channel.send(`You win \`$${betAmount * 5}\`!!!`);
    }

    // if user guesses incorrectly, remove loses from balance
    record.balance -= betAmount;
    record.save();
    return channel.send('You Lose. :pensive:');
  }
}
