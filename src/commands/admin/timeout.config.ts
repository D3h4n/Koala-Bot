import {CommandInteraction, GuildMember} from 'discord.js';
import Command from '../../common.commands.config';
import config from '../../utils/config';
// import config from '../../utils/config';

export default class timeoutCommand extends Command {
  constructor() {
    super(
      'timeout',
      'Put a user in timeout',
      [
        {
          id: '829531557785894923',
          type: 'ROLE',
          permission: true
        }
      ]
    );

    this.addUserOption(option=>(
      option.setName('user').setDescription('User to timeout').setRequired(true)
    ))

    this.addNumberOption(option=>(
      option.setName('time').setDescription('How long to keep em quiet for').setRequired(true)
    ))

    this.addBooleanOption(option=>(
      option.setName('hidden').setDescription('If you too shame to do it infront of everybody')
    ))
  }

  action(interaction: CommandInteraction) {
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
    let timeout = interaction.options.getNumber('time', true) * 60000;

    // // check if time is within range
    if (timeout < 1000) {
      interaction.reply('`That time is too short`');
      return; 
    }

    if (timeout > config.timeoutMaxLimit) {
      interaction.reply('`That time is too large`');
      return; 
    }

    // add timeout and handle errors
    if (!this.addTimeout(memberToTimeout, timeout)) {
      interaction.reply('`Some kinda error or something`');
      return; 
    }

    // send prompt after timeout
    interaction.reply({
      content: `Timed out ${memberToTimeout.toString()} for ${timeout / 1000} seconds`,
      ephemeral: interaction.options.getBoolean('hidden') ?? false
    }
    );
  }

  private async addTimeout(member: GuildMember, timeout: number) {
    // const timeoutID = '416009802112696320'; // ID for timeout role
    let roles = member.roles.cache; // get array of roles

    // remove roles and add timeout role
    try {
      await member.roles.set([], "You've been a bad boy");
      // await member.roles.add(timeoutID);

      // set timer to add roles and remove timeout role
      setTimeout(async () => {
        try {
          // await member.roles.remove(timeoutID);
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
