import Command from '../common.commands.config';
import economyServices from '../../services/economy.services';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { Document } from 'mongoose';
import { ILotto } from '../../models/lotto.model';
import { client } from '../../index';
import { IUser } from '../../models/user.model';
import guildServices from '../../services/guild.services';
import { IGuild } from '../../models/guild.model';

export default class lottoCommand extends Command {
  constructor() {
    super('Lotto', 'lotto', [
      'Play the lotto to win BIG',
      'Usage: $lotto <5 numbers between 1 and 30 inclusive>',
    ]);
  }

  async action(message: Message, args: string[]) {
    // if user provides a lotto id display lotto
    if (args.length <= 2) {
      // get lotto and user records
      let lotto = await economyServices.getLotto(args[1], message.guild?.id);
      const user = await economyServices.getUserByDiscord(message.author.id);

      // assert lotto exists
      if (!lotto) {
        return message.channel.send('`No lottos found with that ID`');
      }

      // assert user exists
      if (!user) {
        return message.channel.send('`No user found`');
      }

      // send information about lotto
      const response = new MessageEmbed();

      response
        .setTitle('Lotto')
        .setDescription([
          `**Lotto Id:** ${lotto.id}`,
          `**End Date:** ${lotto.endDate.toDateString()}`,
          `**End Time:** ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}`,
          `**Entries:** ${lotto.guesses.length}`,
          `**Entered:** ${lotto.users.includes(user?.id)}`,
          `**Ended:** ${lotto.done}`,
        ])
        .setAuthor(
          message.member?.displayName,
          message.author.displayAvatarURL()
        );

      return message.channel.send(response);
    }

    // if user does not provide an id
    // get latest lotto for guild
    let lotto = await economyServices.getLotto(undefined, message.guild?.id);

    // assert that lotto was found
    if (!lotto) {
      return message.channel.send('`No lottos found`');
    }

    if (lotto.done) {
      const user = await economyServices.getUserByDiscord(message.author.id);
      // send information about lotto
      const response = new MessageEmbed();

      response
        .setTitle('Lotto')
        .setDescription([
          `**Lotto Id:** ${lotto.id}`,
          `**End Date:** ${lotto.endDate.toDateString()}`,
          `**End Time:** ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}`,
          `**Entries:** ${lotto.guesses.length}`,
          `**Entered:** ${lotto.users.includes(user?.id)}`,
          `**Ended:** ${lotto.done}`,
        ])
        .setAuthor(
          message.member?.displayName,
          message.author.displayAvatarURL()
        );

      return message.channel.send(response);
    }

    // check if enough numbers
    if (args.length < 6) {
      return message.channel.send('`Must guess 5 numbers between 1 and 30`');
    }

    // check if user has enough money
    const user = await economyServices.getUserByDiscord(message.author.id);

    if (!user || user.balance < 20) {
      return message.channel.send([
        "You don't have enough money",
        '`$20 Entry Fee required`',
      ]);
    }

    // add guess if lotto found
    const guessNums = args.slice(1, 6).map((str) => Number(str));

    // add guess to lotto
    return economyServices
      .addGuess(lotto.id, user.id, guessNums)
      .then(() => {
        // charge user for lotto
        user.balance -= 20;
        user.save();

        // send reponse to channel
        const response = new MessageEmbed();

        response
          .setTitle('New Guess Added')
          .setAuthor(
            message.member?.displayName,
            message.author.displayAvatarURL()
          )
          .setDescription([`**Numbers:** ${args.slice(1, 6).join(' ')}`]);

        return message.channel.send(response);
      })
      .catch(message.channel.send);
  }

  public static async checkLotto() {
    // get list of guilds
    const guilds = await guildServices.GetGuilds();

    // iterate through each guild
    guilds.forEach(async (guild: IGuild & Document<any, any>) => {
      // assert that lottos are running for that guild
      if (!guild.runLotto) {
        return;
      }

      // log message
      console.log(`[server] checking for end of lotto in ${guild.guildName}`);

      // get latest lotto for guild
      const lotto = await economyServices.getLotto(undefined, guild.guildId);

      // get lotto channel for guild
      const lottoChannel = client.channels.cache.get(
        guild.lottoChannelId!
      ) as TextChannel;

      // check if latest lotto is done
      if (!lotto || lotto.done) {
        lottoCommand.createNewLotto(guild, lottoChannel);
        return;
      }

      // check if lotto should have ended
      const today = new Date();

      // end lotto if it should've ended
      if (today.valueOf() > lotto.endDate.valueOf()) {
        lottoCommand.endLotto(lotto, lottoChannel);
        return;
      }

      // calculate remaining time for lotto in minutes
      const difTime = Math.round(
        (lotto.endDate.valueOf() - today.valueOf()) / 6e4
      );

      if (difTime <= 5) {
        const hours = Math.floor(difTime / 60); // calculate hours remaining
        const minutes = difTime % 60; // calculate minutes remaining

        // generate string representing remaining time
        let timeString = 'Less than a minute';

        if (hours > 0 && minutes > 0) {
          timeString = `${hours} Hours and ${minutes} Minutes`;
        } else if (hours > 0) {
          timeString = `${hours} Hour${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
          timeString = `${minutes} Minute${minutes > 1 ? 's' : ''}`;
        }

        // send information about lotto
        const response = new MessageEmbed();
        response
          .setTitle(`\`Lotto ends in ${timeString}\``)
          .setDescription([
            `**Lotto Id:** ${lotto.id}`,
            `**End Date:** ${lotto.endDate.toDateString()}`,
            `**End Time:** ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}`,
            `**Entries:** ${lotto.guesses.length}`,
          ])
          .setAuthor(client.user?.username, client.user?.displayAvatarURL());

        lottoChannel.send(response);
      }
    });
  }

  /**
   * Generate lotto numbers
   *
   * @returns list of numbers
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

  /**
   * Calculate earnings for guess based on lotto numbers
   *
   *
   * @param nums lotto numbers
   * @param guess guess numbers
   * @returns earnings amount
   */
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

  /**
   * End a lotto and calculate earnigns for each guess
   *
   *
   * @param lotto lotto record
   * @param lottoChannel lotto channel
   * @returns
   */
  private static async endLotto(
    lotto: ILotto & Document<any, any>,
    lottoChannel: TextChannel
  ) {
    // get guild record and generate lotto numbers
    const guild = await guildServices.GetGuild(lotto.guildId);
    const nums = lottoCommand.generateNumbers();

    // get entries for lotto
    const guesses = await economyServices.getGuesses(lotto.id);

    // check if there aren't any guesses extend lotto time
    if (!guesses || !guesses.length) {
      lotto.endDate = lottoCommand.generateEndDate(guild);
      lottoChannel.send(
        `\`Extending lotto time to ${lotto.endDate.toDateString()} ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}\``
      );
      lotto.save();
      return;
    }

    const winners: Array<{ user: IUser; earnings: number }> = []; // array storing winners and their earnings

    // iterate through each guess
    for (let entry of guesses) {
      const user = await economyServices.getUserById(entry.userId); // get user record

      // assert that user exists
      if (!user) {
        continue;
      }

      // calculate earnings
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

    // generate and send response
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

    // create new lotto after old one has ended
    lottoCommand.createNewLotto(guild, lottoChannel).catch(console.error);
  }

  private static async createNewLotto(
    guild: IGuild & Document<any, any>,
    lottoChannel: TextChannel
  ) {
    // assert guild exists
    if (!guild) {
      return;
    }

    // generate new end date
    const endDate = lottoCommand.generateEndDate(guild);

    // create new lotto
    const lotto = await economyServices.createLotto(guild.guildId, endDate);

    // generate and send response
    const response = new MessageEmbed();

    response
      .setTitle('New Lotto')
      .setAuthor(client.user?.username, client.user?.displayAvatarURL())
      .setDescription([
        `**Lotto Id:** ${lotto.id}`,
        `**End Date:** ${endDate.toDateString()}`,
        `**End Time:** ${endDate.getHours()}:${endDate.getMinutes()}`,
      ]);

    lottoChannel.send(response);
  }

  private static generateEndDate(guild: IGuild) {
    return new Date(
      Math.ceil(new Date().getTime() / guild.lottoFrequency!) *
        guild.lottoFrequency!
    );
  }
}
