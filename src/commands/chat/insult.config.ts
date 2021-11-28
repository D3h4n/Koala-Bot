import { CommandInteraction } from 'discord.js';
import Command from '../../common.commands.config';

export default class insultCommand extends Command {
  insultFormats: Array<string>;
  wordTypes: Array<'adjective' | 'adverb' | 'noun' | 'verb' | 'expl'>;
  adjective: Array<string>;
  adverb: Array<string>;
  noun: Array<string>;
  verb: Array<string>;
  expl: Array<string>;

  constructor() {
    super(
      'insult', 
      'Insult someone or yourself',
    );

    this.wordTypes = ['adjective', 'adverb', 'noun', 'verb', 'expl'];

    this.adjective = [
      'ugly',
      'messy',
      'lazy',
      'musty',
      'poopy',
      'over grown',
      'stupid',
    ];

    this.adverb = ['stupidly', 'quickly'];

    this.noun = ['dummy', 'bastard', 'poopyhead', 'baby man', 'bot'];

    this.verb = ['fuck yourself', 'dance in the road'];

    this.expl = ['fucking', 'rasshole'];

    this.insultFormats = [
      '{user} you {expl} {adjective} {noun}',
      "{user}, you're such a {adjective} {expl} {noun}",
      'Yuh {expl} {adjective} {noun}, {user}',
      'Go and {expl} {verb} {adverb}, {adjective} {noun}, {user}',
    ];

    this.addUserOption(option => (
      option.setName('user').setDescription('user to insult').setRequired(false)
    ));
  }

  action(interaction: CommandInteraction) {
    // get user to insult
    let user = interaction.options.getUser('user') ?? interaction.user;

    // choose an insult format
    let insultFormat = this.insultFormats[this.rand(this.insultFormats.length)];

    // generate insult from format
    let insult = this.parseFormat(insultFormat, user.toString());

    // send insult
    interaction.reply(insult);
  }

  parseFormat(insultFormat: string, user: string) {
    // replace user specifier with user mention
    let insult = insultFormat.replace('{user}', user);

    // replace other format specifiers with random words
    for (let type of this.wordTypes) {
      insult = insult.replace(
        `{${type}}`,
        this[type][this.rand(this[type].length)]
      );
    }

    // return instul
    return insult;
  }

  // generate random number
  rand(max: number) {
    return Math.floor(Math.random() * max);
  }
}
