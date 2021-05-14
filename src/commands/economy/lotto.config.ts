import Command from '../common.commands.config';
import economyServices from './economy.services';
import config from '../../utils/config';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { ILotto } from 'src/models/lotto.model';
import { Document } from 'mongoose';
import { client } from '../../index';
import { IUser } from '../../models/user.model';

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
      const user = await economyServices.getUserByDiscord(message.author.id);

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
          `**Entered:** ${lotto.users.includes(user?.id)}`,
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
    const user = await economyServices.getUserByDiscord(message.author.id);

    if (!user || user.balance < 20) {
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
      .addGuess(lotto.id, user.id, guessNums)
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
            `**Lotto ID:** ${lotto?.id}`,
            `**Numbers:** ${args.slice(1, 6).join(' ')}`,
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

async function endLotto(
  lotto: ILotto & Document<any, any>,
  lottoChannel: TextChannel
) {
  const nums = generateNumbers(); // get winning numbers

  // get entries for lotto
  const guesses = await economyServices.getGuesses(lotto.id);

  // check if there are any guesses
  if (!guesses || !guesses.length) {
    lottoChannel.send('`Nobody wanted to play` :sob::weary:');
    return;
  }
  const winners: Array<{ user: IUser; earnings: number }> = [];

  for (let entry of guesses) {
    const user = await economyServices.getUserById(entry.userId); // get user record

    if (!user) {
      continue;
    }

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
    winners.push({ user, earnings });
  }

  // update lotto and save
  lotto.done = true;
  lotto.save();

  // send response
  const response = new MessageEmbed();

  response.setTitle('Lotto').setDescription([
    '**Winning Numbers:** ' + nums.map((num) => String(num)).join(' '),
    '**Results:**',
    ...winners
      .sort((a, b) => b.earnings - a.earnings)
      .map(({ user, earnings }, idx) => {
        const guild = client.guilds.cache.find(
          ({ id }) => id === lotto.guildId
        );

        const member = guild?.members.cache.find(
          ({ id }) => id === user.discordId
        );

        return `${idx + 1}. \`${
          member?.displayName || user.username
        }:\` $${earnings}`;
      }),
  ]);

  lottoChannel.send(response);
}

async function createNewLotto(guildId: string, lottoChannel: TextChannel) {
  const endDate = new Date(
    Math.ceil(new Date().getTime() / config.lottoLength) * config.lottoLength
  );

  const newLotto = await economyServices.createLotto(guildId, endDate);

  const response = new MessageEmbed();

  response
    .setTitle('New Lotto')
    .setAuthor(client.user?.username, client.user?.displayAvatarURL())
    .setDescription([
      `**ID:** ${newLotto.id}`,
      `**End Date:** ${endDate.toDateString()}`,
    ]);

  lottoChannel.send(response);
}

export async function checkLotto() {
  console.log('[server] checking for end of lotto');
  const lotto = await economyServices.getLotto();

  const lottoChannel = client.channels.cache.get(
    '842552370960400415'
  ) as TextChannel;

  // check if latest lotto is done
  if (!lotto || lotto.done) {
    createNewLotto('842552370960400415', lottoChannel);
    return;
  }

  // check if lotto should have ended
  const today = new Date();

  if (today.valueOf() > lotto.endDate.valueOf()) {
    endLotto(lotto, lottoChannel);
    return;
  }

  const difTime = Math.round((lotto.endDate.valueOf() - today.valueOf()) / 6e4);

  if (difTime <= 5) {
    const response = new MessageEmbed();
    const hours = Math.floor(difTime / 60); // calculate hours remaining
    const minutes = difTime % 60; // calculate minutes remaining

    let timeString = 'Less than a minute';

    if (hours > 0 && minutes > 0) {
      timeString = `${hours} Hours and ${minutes} Minutes`;
    } else if (hours > 0) {
      timeString = `${hours} Hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      timeString = `${minutes} Minute${minutes > 1 ? 's' : ''}`;
    }

    response
      .setTitle(`\`Lotto ends in ${timeString}\``)
      .setDescription([
        `**ID:** ${lotto.id}`,
        `**End Date:** ${lotto.endDate.toDateString()}`,
        `**Entries:** ${lotto.guesses.length}`,
      ])
      .setAuthor(client.user?.username, client.user?.displayAvatarURL());

    lottoChannel.send(response);
  }
}
