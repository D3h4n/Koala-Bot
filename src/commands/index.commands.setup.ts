import Discord from "discord.js";
import { Command } from "./common.commands.config";
import { helloCommand } from "./chat/hello.config";
import { coinFlipCommand } from "./misc/coinFlip.config";
import { insultCommand } from "./chat/insult.config";
import { echoCommand } from "./chat/echo.config";
import { helpCommand } from "./misc/help.config";
import { youtubeCommand } from "./search/youtube.config";
import { joinCommand } from "./music/join.config";
import { leaveCommand } from "./music/leave.config";
import { playCommand } from "./music/play.config";
import { pauseCommand } from "./music/pause.config";
import { skipCommand } from "./music/skip.config";
import { queueCommand } from "./music/queue.config";
import { stopCommand } from "./music/stop.config";
import { volumeCommand } from "./music/volume.config";

// create a map of commands
let commands = new Discord.Collection<string, Command>();

// add commands to map
// chat commands
commands.set(
  "echo",
  new echoCommand("echo", ["I repeat whatever you want", "Usage: $echo <text>"])
);

commands.set(
  "hello",
  new helloCommand("hello", [
    "Greet someone",
    "Usage: $hello or $hello @friend",
  ])
);

commands.set(
  "insult",
  new insultCommand("insult", [
    "Insult someone or yourself",
    "Usage: $insult or $insult @friend",
  ])
);

// misc commads
commands.set(
  "coinflip",
  new coinFlipCommand("coinflip", [
    "Flip one or more coins",
    "Usage: $coinflip or $coinflip <number>",
  ])
);

commands.set(
  "help",
  new helpCommand(
    "help",
    ["Get information about a command", "Usage: $help or $help <command>"],
    5
  )
);

// music commands
commands.set(
  "join",
  new joinCommand("join", ["Add bot to voice channel", "Usage: $join"])
);

commands.set(
  "leave",
  new leaveCommand("leave", ["Leave voice channel", "Usage: $leave"])
);

commands.set(
  "pause",
  new pauseCommand("pause", ["Pause song", "Usage: $pause"])
);

commands.set("play", new playCommand("play", ["Play music", "$play <song>"]));

commands.set(
  "queue",
  new queueCommand("queue", [`Get's the song queue`, "Usage: $queue"])
);

commands.set(
  "skip",
  new skipCommand("skip", ["Skip the current song", "Usage: $skip"])
);

commands.set(
  "stop",
  new stopCommand("stop", ["Stop the queue", "Usage: $stop"])
);

commands.set(
  "volume",
  new volumeCommand("volume", [
    "Set the volume of the bot",
    "Usage: $volume <percent>",
  ])
);

// search commands
commands.set(
  "youtube",
  new youtubeCommand("youtube", ["Search youtube", "Usage: $youtube <query>"])
);

export default (() => commands)();
