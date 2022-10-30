import { ChatInputCommandInteraction } from "discord.js";
import economyServices from "../../services/economy.services";
import Command from "../../utils/common.commands.config";

export default class giftCommand extends Command {
  constructor() {
    super("gift", "Gift someone currency");

    this.addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to send currency to")
        .setRequired(true)
    );

    this.addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of currency to send")
        .setRequired(true)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    // get author record
    const authorId = interaction.user.id;

    const authorRecord = await economyServices.getUserByDiscord(authorId);

    if (!authorRecord) {
      interaction.reply(
        "`You have no money. Try collecting your daily first.`",
      );
      return;
    }

    // get receiverRecord
    const receiverUser = interaction.options.getUser("user");

    // ensure valid receiver
    if (!receiverUser) {
      interaction.reply("`That user was not found`");
      return;
    }

    if (receiverUser?.bot) {
      interaction.reply("`Bots don't need money`");
      return;
    }

    if (receiverUser.id === authorId) {
      interaction.reply("`You can't send money to yourself.`");
      return;
    }

    const receiverRecord = await economyServices.getUserByDiscord(
      receiverUser.id,
    );

    if (!receiverRecord) {
      interaction.reply("`That user was not found`");
      return;
    }

    // check for valid amount
    const giftAmount = interaction.options.getNumber("amount");

    if (!giftAmount || Number.isNaN(giftAmount) || giftAmount < 1) {
      interaction.reply(
        `\`${interaction.options.data[1].value} is not a valid amount\``,
      );
      return;
    }

    if (giftAmount > authorRecord.balance) {
      interaction.reply(
        `You only have \`$${authorRecord.balance}\`. Yuh broke.`,
      );
      return;
    }

    // transfer funds and save
    authorRecord.balance -= giftAmount;
    receiverRecord.balance += giftAmount;

    authorRecord.save();
    receiverRecord.save();

    // response
    interaction.reply(
      `Gifted \`$${giftAmount}\` to ${receiverUser.toString()}`,
    );
  }
}
