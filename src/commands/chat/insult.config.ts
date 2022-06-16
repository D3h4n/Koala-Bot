import { CommandInteraction } from 'discord.js';
import Command from '../../utils/common.commands.config';

type wordType = 'adjective' | 'adverb' | 'noun' | 'verb' | 'expl';
export default class insultCommand extends Command {
   insultFormats = [
      'Yuh mudda {user}',
      '{user} you {expl} {adjective} {noun}',
      "{user}, you're such a {adjective} {expl} {noun}",
      'Yuh {expl} {adjective} {noun}, {user}',
      'Go and {expl} {verb} {adverb}, {adjective} {noun}, {user}',
      "{user}! Maybe if you got rid of that old yee-yee ass haircut you got you'd get some bitches on your dick. Oh, better yet, maybe Tanisha'll call your dog-ass if she ever stop fuckin' with that brain surgeon or lawyer she fucking with. Niggaaaa",
   ];

   wordTypes: wordType[] = ['adjective', 'adverb', 'noun', 'verb', 'expl'];

   adjective = [
      'ugly',
      'messy',
      'lazy',
      'musty',
      'poopy',
      'over grown',
      'stupid',
   ];

   adverb = ['stupidly', 'quickly'];
   noun = ['dummy', 'bastard', 'poopyhead', 'baby man', 'bot'];
   verb = ['fuck yourself', 'dance in the road'];
   expl = ['fucking', 'rasshole'];

   constructor() {
      super('insult', 'Insult someone or yourself');

      this.addUserOption((option) =>
         option
            .setName('user')
            .setDescription('user to insult')
            .setRequired(false)
      );
   }

   action(interaction: CommandInteraction): void {
      // get user to insult
      const user = interaction.options.getUser('user') ?? interaction.user;

      // choose an insult format
      const insultFormat =
         this.insultFormats[this.rand(this.insultFormats.length)];

      // generate insult from format
      const insult = this.parseFormat(insultFormat, user.toString());

      // send insult
      interaction.reply(insult);
   }

   parseFormat(insultFormat: string, user: string): string {
      // replace user specifier with user mention
      let insult = insultFormat.replace('{user}', user);

      // replace other format specifiers with random words
      for (const type of this.wordTypes) {
         insult = insult.replace(
            `{${type}}`,
            this[type][this.rand(this[type].length)]
         );
      }

      // return instul
      return insult;
   }

   // generate random number
   rand(max: number): number {
      return Math.floor(Math.random() * max);
   }
}
