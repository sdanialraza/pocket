import type { ClientEvents } from "discord.js";
import { z } from "zod";

/**
 * Defines the structure of an event
 */
export type Event<Name extends keyof ClientEvents = keyof ClientEvents> = {
  /**
   * The function to execute when the event is emitted
   *
   * @param parameters - The parameters of the event
   */
  execute(...parameters: ClientEvents[Name]): Promise<void> | void;
  /**
   * The name of the event to listen to
   */
  name: Name;
  /**
   * Whether or not the event should only be listened to once
   *
   * @defaultValue false
   */
  once?: boolean;
};

/**
 * Defines the schema for an event.
 */
export const eventSchema = z.object({
  name: z.string(),
  once: z.boolean().optional().default(false),
  execute: z.function(),
});

/**
 * Defines the predicate to check if an object is a valid Event type.
 *
 * @param structure - The object to check.
 * @returns Whether or not the object is a valid Event type.
 */
export function eventPredicate(structure: unknown): structure is Event {
  return eventSchema.safeParse(structure).success;
}
