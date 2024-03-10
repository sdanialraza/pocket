import { type ButtonInteraction, type CommandInteraction, Events } from "discord.js";
import type { Event } from "../../types/index.js";
import { extractCreatorIdFromBookmark } from "../../util/index.js";

/**
 * Handles the chat input command interaction.
 *
 * @param interaction - The interaction to handle.
 * @returns A promise that resolves when the interaction has been handled.
 */
async function handleCommandInteraction(interaction: CommandInteraction<"cached">): Promise<void> {
  const { client, commandName } = interaction;

  const command = client.commands.get(commandName);

  if (!command) {
    const message = `No command matching ${commandName} was found.`;

    console.error(message);

    await interaction.reply({
      content: message,
      ephemeral: true,
    });

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);

    await interaction.reply({
      content: "⚠️ There was an error while executing this command.",
      ephemeral: true,
    });
  }
}

/**
 * Handles the delete bookmark button interaction.
 *
 * @param interaction - The interaction to handle.
 * @returns A promise that resolves when the interaction has been handled.
 */
async function handleDeleteBookmark(interaction: ButtonInteraction<"cached">): Promise<void> {
  if (interaction.customId !== "delete-bookmark") return;

  if (interaction.user.id !== extractCreatorIdFromBookmark(interaction.message)) {
    await interaction.reply({
      content: "You can only delete bookmarks you created.",
      ephemeral: true,
    });

    return;
  }

  try {
    await interaction.message.delete();

    await interaction.reply({
      content: "Bookmark successfully deleted.",
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);

    await interaction.reply({
      content: "⚠️ There was an error while deleting the bookmark.",
      ephemeral: true,
    });
  }
}

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isAutocomplete()) return;

    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content: "This command wasn't in a cached guild, this shouldn't happen.",
        ephemeral: true,
      });

      return;
    }

    if (interaction.isButton()) {
      await handleDeleteBookmark(interaction);
    }

    if (interaction.isCommand()) {
      await handleCommandInteraction(interaction);
    }
  },
} satisfies Event<Events.InteractionCreate>;
