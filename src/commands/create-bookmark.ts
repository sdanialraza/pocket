import { env } from "node:process";
import {
  type APIButtonComponentWithURL,
  ApplicationCommandType,
  ButtonStyle,
  ComponentType,
  TextInputStyle,
} from "discord.js";
import type { Command } from "../types/index.js";
import { createBookmarkEmbed } from "../util/index.js";

export default {
  data: {
    name: "Create Bookmark",
    type: ApplicationCommandType.Message,
    dm_permission: false,
  },
  async execute(interaction) {
    if (!interaction.isMessageContextMenuCommand()) return;

    const { client, targetMessage, user } = interaction;

    const bookmarksChannel = client.channels.resolve(env.BOOKMARKS_CHANNEL_ID);

    if (!bookmarksChannel?.isTextBased()) {
      await interaction.reply({
        content: "The bookmarks channel not found or isn't a text channel.",
        ephemeral: true,
      });

      return;
    }

    const bookmarks = await bookmarksChannel.messages.fetch({ limit: 100 });

    for (const bookmark of bookmarks.values()) {
      const linkButton = bookmark.components[0]?.components[0] as APIButtonComponentWithURL;

      if (linkButton.url === targetMessage.url) {
        await interaction.reply({
          content: "A bookmark for that message already exists.",
          ephemeral: true,
        });

        return;
      }
    }

    await interaction.showModal({
      customId: "create-bookmark",
      title: "Create Bookmark",
      components: [
        {
          components: [
            {
              customId: "name",
              style: TextInputStyle.Short,
              type: ComponentType.TextInput,
              label: "Name",
              minLength: 1,
              maxLength: 256,
              placeholder: "The name for the bookmark",
              required: false,
            },
          ],
          type: ComponentType.ActionRow,
        },
        {
          components: [
            {
              customId: "description",
              style: TextInputStyle.Paragraph,
              type: ComponentType.TextInput,
              minLength: 1,
              maxLength: 1_024,
              label: "Description",
              placeholder: "The description for the bookmark",
              required: false,
            },
          ],
          type: ComponentType.ActionRow,
        },
        {
          components: [
            {
              customId: "links",
              label: "Links",
              minLength: 1,
              maxLength: 1_024,
              placeholder: "The links for the bookmark separated by a space",
              style: TextInputStyle.Short,
              type: ComponentType.TextInput,
              required: false,
            },
          ],
          type: ComponentType.ActionRow,
        },
      ],
    });

    const modalInteraction = await interaction.awaitModalSubmit({
      filter: interaction => interaction.customId === "create-bookmark",
      time: 60_000,
    });

    const description = modalInteraction.fields.getTextInputValue("description");
    const links = modalInteraction.fields.getTextInputValue("links");
    const name = modalInteraction.fields.getTextInputValue("name");

    try {
      await bookmarksChannel.send({
        embeds: [createBookmarkEmbed({ creator: user, description, links, message: targetMessage, name })],
        components: [
          {
            components: [
              {
                label: "Original Message",
                style: ButtonStyle.Link,
                type: ComponentType.Button,
                url: targetMessage.url,
              },
              {
                custom_id: "delete-bookmark",
                label: "Delete Bookmark",
                style: ButtonStyle.Danger,
                type: ComponentType.Button,
              },
            ],
            type: ComponentType.ActionRow,
          },
        ],
      });

      await modalInteraction.reply({
        content: "Bookmark successfully created.",
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);

      await modalInteraction.reply({
        content: "⚠️ There was an error while creating the bookmark.",
        ephemeral: true,
      });
    }
  },
} satisfies Command;
