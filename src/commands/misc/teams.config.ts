import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../utils/config';
import Command from '../../utils/common.commands.config';

export default class teamsCommand extends Command {
  constructor() {
    super('teams', 
      'Split a list of names into teams',
    );

    this.addNumberOption(option=>
      option.setName('numteams').setDescription('The number of teams to make').setRequired(true)
    )
  }

  action(interaction: CommandInteraction) {
    // get number of teams
    let numTeams = interaction.options.getNumber('numteams');

    if (!numTeams) {
      return;
    }

    // get list of names
    let names = interaction.options.data.slice(1).map(a => a.value?.toString());

    // check for valid number of teams
    if (numTeams < 2) {
      interaction.reply('`Too small number of teams`');
      return; 
    }

    // check if there are enough names to form teams
    if (numTeams > names.length) {
      interaction.reply('`Too little names to make teams`');
      return; 
    }

    // create map to store teams
    let teams: string[][] = []; 

    // split names into teams randomly
    for (let i = 0; names.length > 0; i++) {
      // remove random name from list of names
      let [name] = names.splice(Math.floor(Math.random() * names.length), 1);

      // get corresponding team
      let team = teams[i % numTeams] ?? [];

      // add name to team
      team.push(name!);

      // update team in map
      teams[i % numTeams] = team;
    }

    // create embedded message of teams
    let res = new MessageEmbed();

    res
      .setTitle(`${numTeams} Random Teams`)
      .setColor(config.mainColor)
      .setDescription(this.generateDescription(teams).join('\n'));

    interaction.reply({
      embeds: [res]
    });
  }

  generateDescription(teams: string[][]) {
    // generate text for each team
    return [...teams].map(
      (team, idx) =>
        `**Team ${idx + 1}:**\n` +
        team.reduce((prev, curr) => prev + ', ' + curr) +
        '\n'
    );
  }
}
