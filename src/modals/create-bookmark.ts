import {
  ButtonStyle,
  ComponentType,
  InteractionResponseType,
  MessageFlags,
  type API,
  type APIModalSubmitGuildInteraction,
} from "@discordjs/core/http-only";
import { createBookmarkEmbed, messageLink, respond, type Env } from "../util/index.js";

export type CreateBookmarkModalOptions = {
  api: API;
  env: Env;
  interaction: APIModalSubmitGuildInteraction;
};

export default {
  customId: "create-bookmark",
  async execute({ api, env, interaction }: CreateBookmarkModalOptions) {
    const name = interaction.data.components[0].components[0].value;
    const description = interaction.data.components[1].components[0].value;
    const links = interaction.data.components[2].components[0].value;
    const messageId = interaction.data.components[3].components[0].value;

    const creator = interaction.member.user;
    const channelId = interaction.channel!.id ?? interaction.message!.channel_id;
    const message = await api.channels.getMessage(channelId, messageId);

    const bookmarkEmbed = await createBookmarkEmbed({ api, creator, description, links, message, name });

    await api.channels.createMessage(env.BOOKMARKS_CHANNEL_ID, {
      embeds: [bookmarkEmbed],
      components: [
        {
          components: [
            {
              label: "Original Message",
              style: ButtonStyle.Link,
              type: ComponentType.Button,
              url: messageLink(message.channel_id, message.id, interaction.guild_id),
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

    return respond({
      data: { content: "Bookmark successfully created.", flags: MessageFlags.Ephemeral },
      type: InteractionResponseType.ChannelMessageWithSource,
    });
  },
} as const;
