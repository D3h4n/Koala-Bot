import { ChatInputCommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';
import config from '../../utils/config';
import { PermissionFlagsBits } from 'discord-api-types/v10';

export default class timeoutCommand extends Command {
   constructor() {
      super(
         'timeout',
         'Put a user in timeout',
         PermissionFlagsBits.ModerateMembers,
         '310489953157120023'
      );

      this.addUserOption((option) =>
         option
            .setName('user')
            .setDescription('User to timeout')
            .setRequired(true)
      );

      this.addNumberOption((option) =>
         option
            .setName('time')
            .setDescription('How long to keep em quiet for (minutes)')
            .setRequired(true)
      );

      this.addBooleanOption((option) =>
         option
            .setName('hidden')
            .setDescription('If you too shame to do it infront of everybody')
      );
   }

   action(interaction: ChatInputCommandInteraction): void {
      // get first mentioned member
      const userToTimeout = interaction.options.getUser('user', true);
      const memberToTimeout = interaction.guild?.members.resolve(userToTimeout);

      // check if the member exists
      if (!memberToTimeout) {
         interaction.channel?.send("`I don't know who that is homie`");
         return;
      }

      // check that the member can be timedout
      if (!memberToTimeout.manageable) {
         interaction.reply('`That user is too stronk`');
         return;
      }

      // calculate timeout
      const timeout = interaction.options.getNumber('time', true) * 60000;

      // check if time is within range
      if (timeout < 1000) {
         interaction.reply('`That time is too short`');
         return;
      }

      if (timeout > config.timeoutMaxLimit) {
         interaction.reply('`That time is too large`');
         return;
      }

      // add timeout and handle errors
      memberToTimeout.timeout(timeout, "You've been a bad boy");

      // send prompt after timeout
      interaction.reply({
         content: `Timed out ${memberToTimeout.toString()} for ${
            timeout / 1000
         } seconds`,
         ephemeral: interaction.options.getBoolean('hidden') ?? false,
      });
   }
}
