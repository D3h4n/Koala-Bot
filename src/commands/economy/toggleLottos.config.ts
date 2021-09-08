import Command from '../common.commands.config';
import { Message } from 'discord.js';
import economyServices from '../../services/economy.services';
import guildServices from '../../services/guild.services';

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
    const guildId = message.guild?.id;

    if (!guildId) {
      console.error('`Unable to find guild`');
      return;
    }

    let guild = await guildServices.GetGuild(guildId);

    if (!guild.runLotto) {
      if (args.length < 2) {
        message.channel.send('`Must include frequency`');
        return;
      }

      let lottoFrequency = Math.round(Number(args[1]) * 3.6e6); // convert time to ms

      if (Number.isNaN(lottoFrequency)) {
        message.channel.send(`\`${args[1]} is not a valid number\``);
        return;
      }

      guild = await guildServices.UpdateGuild({
        guildId: guild.guildId,
        runLotto: !guild.runLotto,
        lottoChannelId: message.channel.id,
        lottoFrequency,
      });

      message.channel.send(
        `\`Running Lottos in this channel every ${args[1]} hours\``
      );
    } else {
      guild = await guildServices.UpdateGuild({
        guildId: guild.guildId,
        runLotto: false,
      });

      const lotto = await economyServices.getLotto();

      if (lotto) {
        lotto.done = true;
        lotto.save();
      }

      message.channel.send('`Stopped Lottos`');
    }
  }
}
