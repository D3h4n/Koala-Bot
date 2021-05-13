import { Message } from 'discord.js';
import economyServices from './economy.services';
import Command from '../common.commands.config';

export default class giftCommand extends Command {
  constructor() {
    super('gift', ['Gift someone currency', 'Usage: $gift <@user> <amount>']);
  }

  async action(message: Message, args: string[]) {
    // get author record
    const authorId = message.author.id;

    const authorRecord = await economyServices.getUser(authorId);

    // get receiverRecord
    const receiverUser = message.mentions.users.first();

    const receiverId = receiverUser?.id;

    // ensure valid receiver
    if (!receiverId) {
      message.channel.send('`That user was not found`');
      return;
    }

    if (receiverUser?.bot) {
      message.channel.send("`Bots don't need money`");
      return;
    }

    if (receiverId === authorId) {
      message.channel.send("`You can't send money to yourself.`");
      return;
    }

    const receiverRecord = await economyServices.getUser(receiverId);

    // check for valid amount
    const giftAmount = Number(args[2]);

    if (Number.isNaN(giftAmount) || giftAmount < 1) {
      message.channel.send(`\`${args[2]} is not a valid amount\``);
      return;
    }

    if (giftAmount > authorRecord.balance) {
      message.channel.send(
        `You only have \`$${authorRecord.balance}\`. Yuh broke.`
      );
      return;
    }

    // transfer funds and save
    authorRecord.balance -= giftAmount;
    receiverRecord.balance += giftAmount;

    authorRecord.save();
    receiverRecord.save();

    // response
    message.channel.send(`Gifted \`$${giftAmount}\` to <@!${receiverId}>`);
  }
}
