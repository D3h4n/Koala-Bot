import { CommandInteraction, ApplicationCommandPermissionData } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default abstract class Command extends SlashCommandBuilder {
  permissions: ApplicationCommandPermissionData[] | undefined
  
  constructor(
    name: string,
    description: string,
    permsissions?: ApplicationCommandPermissionData[]
  ) {
    super();
    this.setName(name);
    this.setDescription(description);
    this.permissions = permsissions;
  }

  abstract action(interaction: CommandInteraction): void;
}
