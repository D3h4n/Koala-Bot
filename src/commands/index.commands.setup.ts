import { Command } from "./common.commands.config";
import { helloCommand } from "./hello.config";
import { coinFlipCommand } from "./coinFlip.config";
import { insultCommand } from "./insult.config";
import { commandsCommand } from "./commands.config";
import { echoCommand } from "./echo.config";

// create a map of commands
let commands = new Map<string, Command>();

// add commands to map
commands.set("coinflip", new coinFlipCommand("coinflip"));
commands.set("commands", new commandsCommand("commands"));
commands.set("echo", new echoCommand("echo"));
commands.set("hello", new helloCommand("hello"));
commands.set("insult", new insultCommand("insult"));

export default () => commands;
