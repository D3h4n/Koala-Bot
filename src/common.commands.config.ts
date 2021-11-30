import { CommandInteraction, ApplicationCommandPermissionData } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default abstract class Command extends SlashCommandBuilder {
  permissions: ApplicationCommandPermissionData[] | undefined;
  guildid: string | undefined;

  constructor(
    name: string,
    description: string,
    guildid?: string,
    permissions?: ApplicationCommandPermissionData[]
  ) {
    super();
    this.setName(name);
    this.setDescription(description);
    this.permissions = permissions;
    this.guildid = guildid;
  }

  abstract action(interaction: CommandInteraction): void;
}
