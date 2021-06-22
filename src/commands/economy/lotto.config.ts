import Command from '../common.commands.config';
import economyServices from './economy.services';
import config from '../../utils/config';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Document } from 'mongoose';
import { ILotto } from '../../models/lotto.model';
import { client } from '../../index';
import { IUser } from '../../models/user.model';

export default class lottoCommand extends Command {
  constructor() {
    super('Lotto', 'lotto', [
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
          .setDescription([`**Numbers:** ${args.slice(1, 6).join(' ')}`]);

        message.channel.send(response);
      })
      .catch((error) => {
        message.channel.send(error);
      });
  }

  public static async checkLotto() {
    if (!config.runLottos) {
      return;
    }

    console.log('[server] checking for end of lotto');
    const lotto = await economyServices.getLotto();

    const lottoChannel = client.channels.cache.get(
      config.lottoChannelId
    ) as TextChannel;

    // check if latest lotto is done
    if (!lotto || lotto.done) {
      lottoCommand.createNewLotto('310489953157120023', lottoChannel);
      return;
    }

    // check if lotto should have ended
    const today = new Date();

    if (today.valueOf() > lotto.endDate.valueOf()) {
      lottoCommand.endLotto(lotto, lottoChannel);
      return;
    }

    const difTime = Math.round(
      (lotto.endDate.valueOf() - today.valueOf()) / 6e4
    );

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
          `**End Date:** ${lotto.endDate.toDateString()}`,
          `**Entries:** ${lotto.guesses.length}`,
        ])
        .setAuthor(client.user?.username, client.user?.displayAvatarURL());

      lottoChannel.send(response);
    }
  }

  /**
   * Generate a list of 5 numbers
   */
  private static generateNumbers() {
    const nums: number[] = [];

    for (let i = 0; i < 5; i++) {
      let newNum = Math.floor(Math.random() * 30) + 1;

      if (!nums.includes(newNum)) {
        nums.push(newNum);
      } else {
        i--;
      }
    }

    return nums;
  }

  private static calculateEarnings(nums: number[], guess: number[]) {
    let correctNums = 0;
    let earnings = 0;

    // check if number in guess is a winning number
    guess.forEach((num, idx) => {
      if (num === nums[idx]) {
        correctNums++;
      }
    });

    // add extra for more correctly guessed numbers
    if (correctNums === 5) {
      earnings = 100000;
    } else if (correctNums > 3) {
      earnings = 5000;
    } else {
      guess.forEach((num) => {
        if (nums.includes(num)) {
          earnings += 100;
        }
      });
    }

    return earnings;
  }

  private static async endLotto(
    lotto: ILotto & Document<any, any>,
    lottoChannel: TextChannel
  ) {
    const nums = lottoCommand.generateNumbers(); // get winning numbers

    // get entries for lotto
    const guesses = await economyServices.getGuesses(lotto.id);

    // check if there are any guesses
    if (!guesses || !guesses.length) {
      lottoChannel.send('`Nobody wanted to play` :sob::weary:');
      lotto.done = true;
      lotto.save();
      return;
    }

    const winners: Array<{ user: IUser; earnings: number }> = [];

    for (let entry of guesses) {
      const user = await economyServices.getUserById(entry.userId); // get user record

      if (!user) {
        continue;
      }

      const earnings = lottoCommand.calculateEarnings(nums, entry.guess);

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
      '**__Results__**',
      ...winners
        .sort((a, b) => b.earnings - a.earnings)
        .map(({ user, earnings }, idx) => {
          const guild = client.guilds.cache.find(
            ({ id }) => id === lotto.guildId
          );

          const member = guild?.members.cache.find(
            ({ id }) => id === user.discordId
          );

          return `${idx + 1}. *${
            member?.displayName || user.username
          }:* $${earnings}`;
        }),
    ]);

    lottoChannel.send(response);
    lottoCommand.createNewLotto(lotto.guildId, lottoChannel);
  }

  private static async createNewLotto(
    guildId: string,
    lottoChannel: TextChannel
  ) {
    const endDate = new Date(
      Math.ceil(new Date().getTime() / config.lottoLength) * config.lottoLength
    );

    await economyServices.createLotto(guildId, endDate);

    const response = new MessageEmbed();

    response
      .setTitle('New Lotto')
      .setAuthor(client.user?.username, client.user?.displayAvatarURL())
      .setDescription(`**End Date:** ${endDate.toDateString()}`);

    lottoChannel.send(response);
  }
}
