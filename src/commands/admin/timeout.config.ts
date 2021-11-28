import {CommandInteraction, GuildMember} from 'discord.js';
import Command from '../../common.commands.config';
// import config from '../../utils/config';

export default class timeoutCommand extends Command {
  constructor() {
    super(
      'timeout',
      'Put a user in timeout',
      ['MANAGE_ROLES', 'KICK_MEMBERS']
    );
  }

  action(interaction: CommandInteraction) {
    // get first mentioned member
    const args = interaction.options.data;
    const memberToTimeout = args[0].member as GuildMember;


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

    //TODO: calculate timeout
    // let timeout = (args[1].value as number || 1) * 60000;
    const timeout = 10000;

    // // check if time is within range
    // if (timeout < 1000) {
    //   return interaction.reply('`That time is too short`');
    // }

    // if (timeout > config.timeoutMaxLimit) {
    //   return interaction.reply('`That time is too large`');
    // }

    // add timeout and handle errors
    if (!this.addTimeout(memberToTimeout, timeout)) {
      interaction.reply('`Some kinda error or something`');
      return; 
    }

    // send prompt after timeout
    interaction.reply(
      `Timed out ${memberToTimeout.toString()} for ${timeout / 1000} seconds`
    );
  }

  private async addTimeout(member: GuildMember, timeout: number) {
    const timeoutID = '416009802112696320'; // ID for timeout role
    let roles = [...member.roles.cache.values()].map((role) => role.id); // get array of roles

    // remove roles and add timeout role
    try {
      await member.roles.remove(roles, "You've been a bad boy");
      await member.roles.add(timeoutID);

      // set timer to add roles and remove timeout role
      setTimeout(async () => {
        try {
          await member.roles.remove(timeoutID);
          await member.roles.add(roles);
        } catch (error) {
          console.error(error);
        }
      }, timeout);
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }
}
