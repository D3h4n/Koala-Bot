import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default abstract class Command extends SlashCommandBuilder {
  guildid: string | undefined;

  protected constructor(
    name: string,
    description: string,
    defaultPermissions?: bigint,
    guildid?: string,
  ) {
    super();
    this.setName(name);
    this.setDescription(description);
    this.guildid = guildid;

    if (defaultPermissions) {
      this.setDefaultMemberPermissions(defaultPermissions);
    }
  }

  abstract action(interaction: ChatInputCommandInteraction): void;
}
