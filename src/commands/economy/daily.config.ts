import {
   ChatInputCommandInteraction,
   GuildMember,
   EmbedBuilder,
} from 'discord.js';
import Command from '../../utils/common.commands.config';
import economyServices from '../../services/economy.services';
import config from '../../utils/config';

export default class dailyCommand extends Command {
   static avgGain = 100;
   static randomRange = 20;

   constructor() {
      super('daily', 'earn daily currency');
   }

   async action(interaction: ChatInputCommandInteraction): Promise<void> {
      // get user record or create new record
      const user =
         (await economyServices.getUserByDiscord(interaction.user.id)) ??
         (await economyServices.createUser(
            interaction.user.id,
            interaction.user.username
         ));

      // get today's date
      const today = new Date();

      // check last time user got daily
      if (user.nextDaily.valueOf() > today.valueOf()) {
         const remainingTime = Math.round(
            (user.nextDaily.valueOf() - today.valueOf()) / 60000
         );

         interaction.reply('Stop being greedy.');
         interaction.followUp(
            `You have to wait \`${this.generateTimeString(remainingTime)}\`.`
         );
         return;
      }

      // calculate daily gain
      const gain = this.generateGain();

      // update record
      user.balance += gain;
      user.nextDaily = new Date(today.valueOf() + 8.64e7);
      user.save();

      // send embedded message
      const response = new EmbedBuilder()
         .setAuthor({
            name: (interaction.member as GuildMember)?.displayName,
            iconURL: interaction.user.displayAvatarURL(),
         })
         .setColor(config.mainColor)
         .setDescription(`**Earned:** $${gain}\n**Balance:** $${user.balance}`);

      interaction.reply({
         embeds: [response],
      });
   }

   /**
    * Generate daily gain amount based on average
    * gain and some random fluctuation
    *
    * @returns daily gain amount
    */
   generateGain(): number {
      return (
         dailyCommand.avgGain +
         (Math.floor(Math.random() * (dailyCommand.randomRange + 1)) -
            dailyCommand.randomRange / 2)
      );
   }

   generateTimeString(remainingTime: number): string {
      const hours = Math.floor(remainingTime / 60); // calculate hours remaining
      const minutes = remainingTime % 60; // calculate minutes remaining

      // return string with appropraite labels
      if (hours > 0 && minutes > 0) {
         return `${hours} Hours and ${minutes} Minutes`;
      }

      if (hours > 0) {
         return `${hours} Hour${hours > 1 ? 's' : ''}`;
      }

      if (minutes > 0) {
         return `${minutes} Minute${minutes > 1 ? 's' : ''}`;
      }

      return 'Less than a minute';
   }
}
