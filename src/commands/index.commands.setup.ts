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
commands
  .set("echo", new echoCommand())
  .set("hello", new helloCommand())
  .set("insult", new insultCommand())

  // misc commads
  .set("coinflip", new coinFlipCommand())
  .set("help", new helpCommand())

  // music commands
  .set("join", new joinCommand())
  .set("leave", new leaveCommand())
  .set("pause", new pauseCommand())
  .set("play", new playCommand())
  .set("queue", new queueCommand())
  .set("skip", new skipCommand())
  .set("stop", new stopCommand())
  .set("volume", new volumeCommand())

  // search commands
  .set("youtube", new youtubeCommand());

export default (() => commands)();
