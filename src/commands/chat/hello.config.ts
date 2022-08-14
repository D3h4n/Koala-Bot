import { ChatInputCommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';

export default class helloCommand extends Command {
   greetings: string[];

   constructor() {
      super('hello', 'Greet someone');

      this.greetings = [
         'Hi',
         'Hello',
         'Howdy',
         'Mudda',
         'Bonjour',
         'Salut',
         'Sup',
         'Greetings',
      ];
   }

   action(interaction: ChatInputCommandInteraction): void {
      // get a random greeting from greetings array
      const greeting =
         this.greetings[Math.floor(Math.random() * this.greetings.length)];

      // greet user that called command
      interaction.reply(`${greeting} ${interaction.user.toString()}`);
      return;
   }
}
