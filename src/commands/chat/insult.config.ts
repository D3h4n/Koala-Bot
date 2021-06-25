import { Message } from 'discord.js';
import Command from '../common.commands.config';

export default class insultCommand extends Command {
  insultFormats: Array<string>;
  wordTypes: Array<'adjective' | 'adverb' | 'noun' | 'verb' | 'expl'>;
  adjective: Array<string>;
  adverb: Array<string>;
  noun: Array<string>;
  verb: Array<string>;
  expl: Array<string>;

  constructor() {
    super('Insult', 'insult', [
      'Insult someone or yourself',
      'Usage: $insult or $insult <@User>',
    ]);

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
  }

  action(message: Message) {
    let user =
      message.mentions.users.first()?.toString() ?? message.author.toString();

    let insultFormat = this.insultFormats[this.rand(this.insultFormats.length)];

    let insult = this.parseFormat(insultFormat, user);

    return message.channel.send(insult);
  }

  parseFormat(insultFormat: string, user: string) {
    let insult = insultFormat.replace('{user}', user);

    for (let type of this.wordTypes) {
      insult = insult.replace(
        `{${type}}`,
        this[type][this.rand(this[type].length)]
      );
    }

    return insult;
  }

  rand(max: number) {
    return Math.floor(Math.random() * max);
  }
}
