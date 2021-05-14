import { Message, MessageEmbed, TextChannel } from 'discord.js';
import Command from '../common.commands.config';
import economyServices from './economy.services';
import { ILotto, IWinner } from 'src/models/lotto.model';
import { Document } from 'mongoose';
import { client } from '../../index';

export default class lottoCommand extends Command {
  constructor() {
    super('lotto', [
      'Play the lotto to win BIG',
      'Usage: $lotto <5 numbers between 1 and 30 inclusive>',
    ]);
  }

  async action(message: Message, args: string[]) {
    let lotto = await economyServices.getLotto();

    if (!lotto) {
      message.channel.send('`No lottos found`');
      return;
    }

    if (lotto.done || args.length <= 2) {
      lotto = args[2] ? await economyServices.getLotto(args[2]) : lotto;

      if (!lotto) {
        message.channel.send('`No lottos found with that ID`');
        return;
      }

      const response = new MessageEmbed();

      response
        .setTitle('Lotto')
        .setDescription([
          `**ID:** ${lotto.id}`,
          `**End Date:** ${lotto.endDate.toDateString()}`,
          `**Entries:** ${lotto.guesses.length}`,
          `**Entered:** ${lotto.users.includes(message.author.id)}`,
          `**Ended:** ${lotto.done}`,
        ])
        .setAuthor(
          message.member?.displayName,
          message.author.displayAvatarURL()
        );

      message.channel.send(response);
      return;
    }

    // check if enough numbers
    if (args.length < 6) {
      message.channel.send('`Must guess 5 numbers between 1 and 30`');
      return;
    }

    // check if user has enough money
    const user = await economyServices.getUser(message.author.id);

    if (user.balance < 20) {
      message.channel.send([
        "You don't have enough money",
        '`$20 Entry Fee required`',
      ]);
      return;
    }

    // add guess if lotto found
    const guessNums = args.slice(1, 6).map((str) => Number(str));

    // check if all guess are numbers
    for (let num of guessNums) {
      if (Number.isNaN(num) || num < 1 || num > 30) {
        message.channel.send(`\`${num} is not a valid number\``);
        return;
      }
    }

    economyServices
      .addGuess(lotto.id, message.author.id, guessNums)
      .then(() => {
        user.balance -= 20;
        user.save();

        const response = new MessageEmbed();

        response
          .setTitle('New Guess Added')
          .setAuthor(
            message.member?.displayName,
            message.author.displayAvatarURL()
          )
          .setDescription([
            `Lotto ID: ${lotto?.id}`,
            `Numbers: ${args.slice(1, 6).join(' ')}`,
          ]);

        message.channel.send(response);
      })
      .catch((error) => {
        message.channel.send(error);
      });
  }
}

/**
 * Generate a list of 5 numbers
 */
const generateNumbers = function () {
  const nums: number[] = [];

  for (let i = 0; i < 5; i++) {
    nums.push(Math.floor(Math.random() * 30) + 1);
  }

  return nums;
};

export async function endLotto(lotto: ILotto & Document<any, any>) {
  const nums = generateNumbers(); // get winning numbers

  // get entries for lotto
  const guesses = await economyServices.getGuesses(lotto.id);

  // get channel to send messages
  const channel = client.channels.cache.get(
    '842552370960400415'
  ) as TextChannel;

  // check if there are any guesses
  if (!guesses || !guesses.length) {
    channel.send('`Nobody wanted to play` :sob::weary:');
    return;
  }

  let winners: IWinner[] = [];

  for (let entry of guesses) {
    const user = await economyServices.getUser(entry.userId); // get user record
    let earnings = 0;

    // check if number in guess is a winning number
    entry.guess.forEach((num) => {
      if (nums.includes(num)) {
        earnings += 100;
      }
    });

    // add extra for more correctly guessed numbers
    if (earnings === 500) {
      earnings += 100000;
    } else if (earnings > 300) {
      earnings += 5000;
    }

    // update user with earnings
    user.balance += earnings;
    user.save();

    // add to winners array
    winners.push({ userId: user.id, earnings });
  }

  // update lotto and save
  lotto.winners = winners;
  lotto.done = true;
  lotto.save();

  // send response
  const response = new MessageEmbed();

  response.setTitle('Lotto').setDescription([
    '**Winning Numbers:** ' + nums.map((num) => String(num)).join(' '),
    '**Results:**',
    ...winners
      .sort((a, b) => b.earnings - a.earnings)
      .map(({ userId, earnings }, idx) => {
        const guild = client.guilds.resolve('310489953157120023');

        const member = guild?.members.resolve(userId);

        return `${idx + 1}. \`${member?.displayName}:\` $${earnings}`;
      }),
  ]);

  channel.send(response);
}
