import type { PathLike } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { URL } from "node:url";
import { type Command, commandPredicate } from "../types/command.js";
import { type Event, eventPredicate } from "../types/event.js";

/**
 * A predicate to check if the structure is valid
 */
export type StructurePredicate<Type> = (structure: unknown) => structure is Type;

/**
 * Loads all the structures from the provided directory path.
 *
 * @typeParam Type - The type of the structure to load.
 * @param path - The directory path to load the structures from.
 * @param predicate - The predicate to check if a structure is valid.
 * @returns The loaded structures.
 */
async function loadStructures<Type>(path: PathLike, predicate: StructurePredicate<Type>): Promise<Type[]> {
  const statDir = await stat(path);

  if (!statDir.isDirectory()) {
    throw new Error(`The directory at "${path}" is not a directory.`);
  }

  const files = await readdir(path);

  const structures: Type[] = [];

  for (const file of files) {
    const statFile = await stat(new URL(`${path}/${file}`));

    if (statFile.isDirectory()) {
      structures.push(...(await loadStructures(new URL(`${path}/${file}`), predicate)));
      continue;
    }

    if (!file.endsWith(".js")) {
      continue;
    }

    const structure = (await import(`${path}/${file}`)).default;

    if (!predicate(structure)) {
      console.warn(`The file at "${path}/${file}" is not a valid structure.`);
      continue;
    }

    structures.push(structure);
  }

  return structures;
}

/**
 * Loads all the commands from the provided directory path.
 *
 * @param path - The directory path to load the commands from.
 * @returns The loaded commands.
 */
export async function loadCommands(path: PathLike): Promise<Command[]> {
  return loadStructures(path, commandPredicate);
}

/**
 * Loads all the events from the provided directory path.
 *
 * @param path - The directory path to load the events from.
 * @returns The loaded events.
 */
export async function loadEvents(path: PathLike): Promise<Event[]> {
  return loadStructures(path, eventPredicate);
}
