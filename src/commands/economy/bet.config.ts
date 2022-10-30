import { ChatInputCommandInteraction } from "discord.js";
import Command from "../../utils/common.commands.config";
import economyServices from "../../services/economy.services";

export default class betCommand extends Command {
  constructor() {
    super("bet", "Guess a number between 1 and 5 to win money");

    this.addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount to Bet")
        .setRequired(true)
    );

    this.addNumberOption((option) =>
      option.setName("guess").setDescription("guess").setRequired(true)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    // get the bet amount
    const betAmount = interaction.options.getNumber("amount");

    // assert that bet amount is a valid number
    if (!betAmount || Number.isNaN(betAmount) || betAmount < 1) {
      interaction.reply(
        `\`${interaction.options.data[0].value}\` is not a valid amount`,
      );
      return;
    }

    // get user record
    const record = await economyServices.getUserByDiscord(
      interaction.user.id,
    );

    // assert that user has a record
    if (!record) {
      interaction.reply(
        "`You have no money. Try collecting your daily first`",
      );
      return;
    }

    // check if user has enough balance for bet
    if (record.balance < betAmount) {
      interaction.reply(
        `You only have \`$${record.balance}\`. Get you're money up.`,
      );
      return;
    }

    // get guess
    const guess = interaction.options.getNumber("guess");

    // assert a valid guess
    if (!guess || Number.isNaN(guess) || guess < 1 || guess > 5) {
      interaction.reply(
        `\`${interaction.options.data[1].value}\` is not a valid amount`,
      );
      return;
    }

    // generate random number
    const result = Math.floor(Math.random() * 5) + 1;

    // send result to channel
    interaction.reply(`\`Result: ${result}\``);

    // if user guesses correctly, add earnings to balance
    if (result === guess) {
      record.balance += betAmount * 4;
      record.save();
      interaction.followUp(`You win \`$${betAmount * 5}\`!!!`);
      return;
    }

    // if user guesses incorrectly, remove loses from balance
    record.balance -= betAmount;
    record.save();
    interaction.followUp("You Lose. :pensive:");
  }
}
