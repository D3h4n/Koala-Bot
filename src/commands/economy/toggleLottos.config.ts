import Command from '../../utils/common.commands.config';
import { CommandInteraction } from 'discord.js';
import economyServices from '../../services/economy.services';
import guildServices from '../../services/guild.services';
import config from '../../utils/config';

export default class toggleLottosCommand extends Command {
  constructor() {
    super(
      'togglelottos',
      'Turn lottos on and off',
      '310489953157120023',
      [ '829531557785894923' ]
    );

    this.addNumberOption(option=>(
      option.setName('frequency').setDescription('How often to run lottos (hours)').setRequired(false)
    ))
  }

  async action(interaction: CommandInteraction) {
    // get guild id
    const guildId = interaction.guild?.id;

    // assert guild id exists
    if (!guildId) {
      console.error('`Unable to find guild`');
      return;
    }

    // get guild
    let guild = await guildServices.GetGuild(guildId);

    // check if guild is running lottos
    if (!guild.runLotto) {
      // check for number of arguments
      if (interaction.options.data.length < 1) {
        interaction.reply('`Must include frequency`');
        return;
      }

      let lottoFrequency = Math.round(interaction.options.getNumber('frequency')! * 3.6e6); // convert time to ms

      // assert valid lotto frequency
      if (Number.isNaN(lottoFrequency) || lottoFrequency === 0) {
        interaction.reply(`\`${interaction.options.data[0].value} is not a valid number\``);
        return;
      }

      // align lottoFrequency with eventLoopTimeDelay
      lottoFrequency =
        Math.ceil(lottoFrequency / config.eventLoopTimeDelay) *
        config.eventLoopTimeDelay;

      // Update guild information
      guild = await guildServices.UpdateGuild({
        guildId: guild.guildId,
        runLotto: !guild.runLotto,
        lottoChannelId: interaction.channel?.id,
        lottoFrequency,
      });

      // send response
      interaction.reply(
        `\`Running Lottos in this channel every ${
          lottoFrequency * 3.6e6
        } hours\``
      );
    } else {
      // update guild information
      guild = await guildServices.UpdateGuild({
        guildId: guild.guildId,
        runLotto: false,
      });

      // get latest lotto for guild
      const lotto = await economyServices.getLotto(undefined, guild.guildId);

      // end last lotto
      if (lotto) {
        lotto.done = true;
        lotto.save();
      }

      // send response
      interaction.reply('`Stopped Lottos`');
    }
  }
}
