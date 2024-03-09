import type { CommandInteraction, RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { z } from "zod";

/**
 * Defines the structure of a command.
 */
export type Command = {
  /**
   * The data for a command.
   */
  data: RESTPostAPIApplicationCommandsJSONBody;
  /**
   * The function to execute when the command is ran.
   *
   * @param interaction - The interaction of the command.
   */
  execute(interaction: CommandInteraction<"cached">): Promise<void>;
};

export const commandSchema = z.object({
  data: z.record(z.unknown()),
  execute: z.function().returns(z.promise(z.unknown())),
});

/**
 * Defines the predicate to check if an object is a valid Command type.
 *
 * @param structure - The object to check
 * @returns Whether or not the object is a valid Command type.
 */
export function commandPredicate(structure: unknown): structure is Command {
  return commandSchema.safeParse(structure).success;
}
