import Command from '../common.commands.config';
import { Message } from 'discord.js';
import economyServices from '../../services/economy.services';
import guildServices from '../../services/guild.services';
import config from '../../utils/config';

export default class toggleLottosCommand extends Command {
  constructor() {
    super(
      'Toggle Lottos',
      'togglelottos',
      ['Turn lottos on and off', 'Usage:', '$togglelottos <frequency (hours)>'],
      ['tlotto'],
      ['ADMINISTRATOR']
    );
  }

  async action(message: Message, args: string[]) {
    // get guild id
    const guildId = message.guild?.id;

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
      if (args.length < 2) {
        message.channel.send('`Must include frequency`');
        return;
      }

      let lottoFrequency = Math.round(Number(args[1]) * 3.6e6); // convert time to ms

      // assert valid lotto frequency
      if (Number.isNaN(lottoFrequency) || lottoFrequency === 0) {
        message.channel.send(`\`${args[1]} is not a valid number\``);
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
        lottoChannelId: message.channel.id,
        lottoFrequency,
      });

      // send response
      message.channel.send(
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
      message.channel.send('`Stopped Lottos`');
    }
  }
}
