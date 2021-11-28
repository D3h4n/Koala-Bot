import { CommandInteraction, GuildMember, PermissionString } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default abstract class Command extends SlashCommandBuilder {
  perms: PermissionString[] | undefined


  constructor(
    name: string,
    description: string,
    permissions?: PermissionString[]
  ) {
    super();
    this.setName(name);
    this.setDescription(description);
    this.perms = permissions;
  }

  response (interaction: CommandInteraction) {
    if (this.perms) {
      let member = interaction.member as GuildMember;
      for (let perm of this.perms) {
        if (!member.permissions.has(perm, true)) {
          interaction.reply('You should be able to see this');
          return;
        }
      }
    }

    this.action(interaction);
  }

  abstract action(interaction: CommandInteraction): void;
}
