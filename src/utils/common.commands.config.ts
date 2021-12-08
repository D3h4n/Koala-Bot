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
      guildid?: string,
      roles?: string[],
      users?: string[]
   ) {
      super();
      this.setName(name);
      this.setDescription(description);

      if (roles) {
         this.permissions = roles.map((id) => ({
            id,
            type: 1,
            permission: true,
         }));
      }

      if (users) {
         if (!this.permissions) {
            this.permissions = [];
         }

         this.permissions.concat(
            users.map((id) => ({
               id,
               type: 2,
               permission: true,
            }))
         );
      }

      this.guildid = guildid;
   }

   abstract action(interaction: CommandInteraction): void;
}
