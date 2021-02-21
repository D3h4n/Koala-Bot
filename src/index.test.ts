import { Command } from "./commands/common.commands.config";
import commands from "./commands/index.commands.setup";

test("Test that commands loaded", () => {
  expect(commands()).toBeDefined();
});

test("test commands exist", () => {
  commands().forEach((command) => {
    expect(command).toBeDefined();
    expect(command).toBeInstanceOf(Command);
  });
});
