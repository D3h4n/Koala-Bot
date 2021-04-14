import { Message, MessageEmbed } from 'discord.js';
import config from '../../config';
import Command from '../common.commands.config';

export default class teamsCommand extends Command {
  constructor() {
    super('teams', [
      'Split a list of names into teams',
      'Usage:',
      '$teams <no. teams> <name 1> <name 2> ... <name n>',
    ]);
  }

  action(message: Message, args: string[]) {
    // get number of teams
    let numTeams = parseInt(args[1]);

    // check for valid number
    if (Number.isNaN(numTeams))
      return message.channel.send(`${args[1]} is not a number`);

    // get list of names
    let names = args.slice(2);

    // check for valid number of teams
    if (numTeams < 2)
      return message.channel.send('`Too small number of teams`');

    // check if there are enough names to form teams
    if (numTeams > names.length)
      return message.channel.send('`Too little names to make teams`');

    // create map to store teams
    let teams: Map<number, Array<string>> = new Map();

    // split names into teams randomly
    for (let i = 0; names.length > 0; i++) {
      // remove random name from list of names
      let [name] = names.splice(Math.floor(Math.random() * names.length), 1);

      // get corresponding team
      let team = teams.get(i % numTeams) ?? [];

      // add name to team
      team.push(name);

      // update team in map
      teams.set(i % numTeams, team);
    }

    // create embedded message of teams
    let res = new MessageEmbed();

    res
      .setTitle(`${numTeams} Random Teams`)
      .setColor(config.mainColor)
      .setDescription(this.generateDescription(teams));

    return message.channel.send(res);
  }

  generateDescription(teams: Map<number, string[]>) {
    // generate text for each team
    return [...teams.values()].map(
      (team, idx) =>
        `**Team ${idx + 1}:**\n` +
        team.reduce((prev, curr) => prev + ', ' + curr) +
        '\n'
    );
  }
}
