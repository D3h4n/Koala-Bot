import Command from "../../utils/common.commands.config";
import economyServices from "../../services/economy.services";
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  TextChannel,
} from "discord.js";
import { Document } from "mongoose";
import { ILotto } from "../../models/lotto.model";
import { client } from "../../index";
import { IUser } from "../../models/user.model";
import guildServices from "../../services/guild.services";
import { IGuild } from "../../models/guild.model";
import config from "../../utils/config";

export default class lottoCommand extends Command {
  constructor() {
    super("lotto", "Play the lotto to win BIG");

    this.addStringOption((option) =>
      option
        .setName("lottoid")
        .setDescription("ID of lotto")
        .setRequired(false)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    // if user provides a lotto id display lotto
    if (interaction.options.data.length <= 2) {
      // get lotto and user records
      const lotto = await economyServices.getLotto(
        interaction.options.getString("lottoid") ?? undefined,
        interaction.guild?.id,
      );

      const user = await economyServices.getUserByDiscord(
        interaction.user.id,
      );

      // assert lotto exists
      if (!lotto) {
        interaction.reply("`No lottos found with that ID`");
        return;
      }

      // assert user exists
      if (!user) {
        interaction.reply("`No user found`");
        return;
      }

      // send information about lotto
      const response = new EmbedBuilder()
        .setTitle("Lotto")
        .setColor(config.mainColor)
        .setDescription(
          [
            `**Lotto Id:** ${lotto.id}`,
            `**End Date:** ${lotto.endDate.toDateString()}`,
            `**End Time:** ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}`,
            `**Entries:** ${lotto.guesses.length}`,
            `**Entered:** ${lotto.users.includes(user?.id)}`,
            `**Ended:** ${lotto.done}`,
          ].join("\n"),
        )
        .setAuthor({
          name: (interaction.member as GuildMember)?.displayName,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.reply({
        embeds: [response],
      });
      return;
    }

    // if user does not provide an id
    // get latest lotto for guild
    const lotto = await economyServices.getLotto(
      undefined,
      interaction.guild?.id,
    );

    // assert that lotto was found
    if (!lotto) {
      interaction.reply("`No lottos found`");
      return;
    }

    if (lotto.done) {
      const user = await economyServices.getUserByDiscord(
        interaction.user.id,
      );
      // send information about lotto
      const response = new EmbedBuilder()
        .setTitle("Lotto")
        .setColor(config.mainColor)
        .setDescription(
          [
            `**Lotto Id:** ${lotto.id}`,
            `**End Date:** ${lotto.endDate.toDateString()}`,
            `**End Time:** ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}`,
            `**Entries:** ${lotto.guesses.length}`,
            `**Entered:** ${lotto.users.includes(user?.id)}`,
            `**Ended:** ${lotto.done}`,
          ].join("\n"),
        )
        .setAuthor({
          name: (interaction.member as GuildMember)?.displayName,
          iconURL: interaction.user.displayAvatarURL(),
        });

      interaction.reply({
        embeds: [response],
      });
      return;
    }

    // check if enough numbers
    if (interaction.options.data.length < 6) {
      interaction.reply("`Must guess 5 numbers between 1 and 30`");
      return;
    }

    // check if user has enough money
    const user = await economyServices.getUserByDiscord(interaction.user.id);

    if (!user || user.balance < 20) {
      interaction.reply("You don't have enough money");
      interaction.followUp("`$20 Entry Fee required`");
      return;
    }

    // add guess if lotto found
    const guessNums = interaction.options.data
      .slice(0, 5)
      .map(({ value }) => Number(value));

    // add guess to lotto
    economyServices
      .addGuess(lotto.id, user.id, guessNums)
      .then(() => {
        // charge user for lotto
        user.balance -= 20;
        user.save();

        // send reponse to channel
        const response = new EmbedBuilder()
          .setTitle("New Guess Added")
          .setColor(config.mainColor)
          .setAuthor({
            name: (interaction.member as GuildMember)?.displayName,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setDescription(`**Numbers:** ${guessNums.join(" ")}`);

        interaction.reply({
          embeds: [response],
        });
      })
      .catch(interaction.reply);
  }

  public static async checkLotto(): Promise<void> {
    // get list of guilds
    const guilds = await guildServices.GetGuilds();

    // iterate through each guild
    guilds.forEach(async (guild: IGuild & Document<unknown, unknown>) => {
      // assert that lottos are running for that guild
      if (!guild.runLotto) {
        return;
      }

      // log message
      console.log(
        `[server] checking for end of lotto in ${guild.guildName}`,
      );

      // get latest lotto for guild
      const lotto = await economyServices.getLotto(undefined, guild.guildId);

      // get lotto channel for guild
      const lottoChannel = client.channels.cache.get(
        guild.lottoChannelId ?? "",
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
        (lotto.endDate.valueOf() - today.valueOf()) / 6e4,
      );

      if (difTime <= 5) {
        const hours = Math.floor(difTime / 60); // calculate hours remaining
        const minutes = difTime % 60; // calculate minutes remaining

        // generate string representing remaining time
        let timeString = "Less than a minute";

        if (hours > 0 && minutes > 0) {
          timeString = `${hours} Hours and ${minutes} Minutes`;
        } else if (hours > 0) {
          timeString = `${hours} Hour${hours > 1 ? "s" : ""}`;
        } else if (minutes > 0) {
          timeString = `${minutes} Minute${minutes > 1 ? "s" : ""}`;
        }

        // send information about lotto
        const response = new EmbedBuilder()
          .setTitle(`\`Lotto ends in ${timeString}\``)
          .setColor(config.mainColor)
          .setDescription(
            [
              `**Lotto Id:** ${lotto.id}`,
              `**End Date:** ${lotto.endDate.toDateString()}`,
              `**End Time:** ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}`,
              `**Entries:** ${lotto.guesses.length}`,
            ].join("\n"),
          )
          .setAuthor({
            name: client.user?.username ?? "No Display Name",
            iconURL: client.user?.displayAvatarURL(),
          });

        lottoChannel.send({
          embeds: [response],
        });
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
      const newNum = Math.floor(Math.random() * 30) + 1;

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
   * @param lotto lotto record
   * @param lottoChannel lotto channel
   * @returns
   */
  private static async endLotto(
    lotto: ILotto & Document<unknown, unknown>,
    lottoChannel: TextChannel,
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
        `\`Extending lotto time to ${lotto.endDate.toDateString()} ${lotto.endDate.getHours()}:${lotto.endDate.getMinutes()}\``,
      );
      lotto.save();
      return;
    }

    const winners: Array<{ user: IUser; earnings: number }> = []; // array storing winners and their earnings

    // iterate through each guess
    for (const entry of guesses) {
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
    const response = new EmbedBuilder()
      .setTitle("Lotto")
      .setColor(config.mainColor)
      .setDescription(
        [
          "**Winning Numbers:** " +
          nums.map((num) => String(num)).join(" "),
          "**__Results__**",
          ...winners
            .sort((a, b) => b.earnings - a.earnings)
            .map(({ user, earnings }, idx) => {
              const guild = client.guilds.cache.find(
                ({ id }) => id === lotto.guildId,
              );

              const member = guild?.members.cache.find(
                ({ id }) => id === user.discordId,
              );

              return `${idx + 1}. *${
                member?.displayName || user.username
              }:* $${earnings}`;
            }),
        ].join("\n"),
      );

    lottoChannel.send({
      embeds: [response],
    });

    // create new lotto after old one has ended
    lottoCommand.createNewLotto(guild, lottoChannel).catch(console.error);
  }

  private static async createNewLotto(
    guild: IGuild & Document<unknown, unknown>,
    lottoChannel: TextChannel,
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
    const response = new EmbedBuilder()
      .setTitle("New Lotto")
      .setColor(config.mainColor)
      .setAuthor({
        name: client.user?.username ?? "No Display Name",
        iconURL: client.user?.displayAvatarURL(),
      })
      .setDescription(
        [
          `**Lotto Id:** ${lotto.id}`,
          `**End Date:** ${endDate.toDateString()}`,
          `**End Time:** ${endDate.getHours()}:${endDate.getMinutes()}`,
        ].join("\n"),
      );

    lottoChannel.send({
      embeds: [response],
    });
  }

  private static generateEndDate(guild: IGuild) {
    const frequency = guild.lottoFrequency || config.eventLoopTimeDelay;

    return new Date(Math.ceil(new Date().getTime() / frequency) * frequency);
  }
}
