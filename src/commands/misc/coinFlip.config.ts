import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import Command from "../../utils/common.commands.config";
import config from "../../utils/config";

export default class coinFlipCommand extends Command {
  constructor() {
    super("coinflip", "Flip one or more coins");

    this.addNumberOption((option) =>
      option.setName("amount").setDescription("Amount of coins to flip")
    );
  }

  action(interaction: ChatInputCommandInteraction): void {
    // set default values
    const flips: string[] = [];
    const times = interaction.options.getNumber("amount") ?? 1;

    // generate results of flips
    for (let i = 0; i < times; i++) {
      flips.push(Math.round(Math.random()) ? "Heads" : "Tails");
    }

    // if more than one flip
    if (times > 1) {
      // generate and send message embed of flips
      const response = new EmbedBuilder({
        title: "Coin Flips",
        description: ["**Results:**", ...flips].join("\n"),
        color: config.mainColor,
        author: {
          name: (interaction.member as GuildMember)?.displayName ??
            "No Display Name",
          iconURL: interaction.user.displayAvatarURL(),
        },
      });

      interaction.reply({
        embeds: [response],
      });

      return;
    }

    // return one flip
    interaction.reply(`\`${flips[0]}\``);
  }
}
