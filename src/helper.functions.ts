import { Message } from 'discord.js';

// functions
export const log = function logEveryCommand({
  content,
  author,
  guild,
  channel,
}: Message) {
  const textChannelName = guild?.channels.resolve(channel.id)?.name;

  console.log(
    `[server] User: ${author.tag} Channel: ${textChannelName} Command: ${content}`
  );
};

export const parseCommand = function (cmd: string) {
  let args: string[] = []; //args array
  let word = ''; // store each arg

  // check if quotations are completed
  if ((cmd.match(/"/g)?.length ?? 0) % 2 !== 0) {
    throw new Error('Incomplete quotes');
  }

  // add space to the end of the command
  cmd += ' ';

  for (let i = 0; i < cmd.length; i++) {
    // if space add word to args and clear word
    if (cmd[i] === ' ') {
      if (word) {
        args.push(word);
      }

      word = '';
      continue;
    }

    if (cmd[i] === '"') {
      // add to word characters until next quote
      for (i++; cmd[i] !== '"' && i < cmd.length; i++) {
        word += cmd[i];
      }
    } else {
      // add character to word
      word += cmd[i];
    }
  }

  return args;
};
