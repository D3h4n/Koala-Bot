import {
   CommandInteraction,
   ApplicationCommandPermissionData,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default abstract class Command extends SlashCommandBuilder {
   permissions: ApplicationCommandPermissionData[] | undefined;
   guildid: string | undefined;

   constructor(
      name: string,
      description: string,
      defaultPermissions?: bigint,
      guildid?: string
   ) {
      super();
      this.setName(name);
      this.setDescription(description);
      this.guildid = guildid;

      if (defaultPermissions) {
         this.setDefaultMemberPermissions(defaultPermissions);
      }
   }

   abstract action(interaction: CommandInteraction): void;
}
