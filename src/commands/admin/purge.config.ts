import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import config from "../../utils/config";
import Command from "../../utils/common.commands.config";
import { ChannelType, PermissionFlagsBits } from "discord-api-types/v10";

export default class purgeCommand extends Command {
  constructor() {
    super(
      "purge",
      "Remove all messages from a chat",
      PermissionFlagsBits.ManageChannels,
    );

    this.addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Name of this channel")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    );
  }

  async action(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel(
      "channel",
      true,
    ) as TextChannel;

    if (channel === interaction.channel) {
      const newChannel = await channel.clone();

      channel.delete("Purging");

      const msg = await newChannel.send("`Channel Successfully purged`");

      setTimeout(() => msg.delete().catch(console.error), config.msgTimeout);
    }
  }
}
