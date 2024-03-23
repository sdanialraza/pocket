import {
  ApplicationCommandType,
  ChannelType,
  ComponentType,
  InteractionResponseType,
  MessageFlags,
  TextInputStyle,
  type API,
  type APIButtonComponentWithURL,
  type APIMessageApplicationCommandGuildInteraction,
} from "@discordjs/core/http-only";
import { messageLink, respond, type Env } from "../util/index.js";

export type CreateBookmarkCommandOptions = {
  api: API;
  env: Env;
  interaction: APIMessageApplicationCommandGuildInteraction;
};

export default {
  data: {
    name: "Create Bookmark",
    type: ApplicationCommandType.Message,
    dm_permission: false,
  },
  async execute({ api, env, interaction }: CreateBookmarkCommandOptions): Promise<Response> {
    const bookmarksChannel = await api.channels.get(env.BOOKMARKS_CHANNEL_ID);

    if (bookmarksChannel.type !== ChannelType.GuildText) {
      return respond({
        data: { content: "The bookmarks channel is not a text channel.", flags: MessageFlags.Ephemeral },
        type: InteractionResponseType.ChannelMessageWithSource,
      });
    }

    const bookmarks = await api.channels.getMessages(bookmarksChannel.id, { limit: 100 });

    const message = interaction.data.resolved.messages[interaction.data.target_id];

    for (const bookmark of bookmarks) {
      const linkButton = bookmark.components?.[0]?.components[0] as APIButtonComponentWithURL;

      if (linkButton.url === messageLink(message.channel_id, message.id, interaction.guild_id)) {
        return respond({
          data: { content: "A bookmark for that message already exists.", flags: MessageFlags.Ephemeral },
          type: InteractionResponseType.ChannelMessageWithSource,
        });
      }
    }

    return respond({
      type: InteractionResponseType.Modal,
      data: {
        custom_id: "create-bookmark",
        title: "Create Bookmark",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                custom_id: "name",
                label: "Name",
                max_length: 256,
                min_length: 1,
                placeholder: "The name for the bookmark",
                required: false,
                style: TextInputStyle.Short,
                type: ComponentType.TextInput,
              },
            ],
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                custom_id: "description",
                label: "Description",
                max_length: 1_024,
                min_length: 1,
                placeholder: "The description for the bookmark",
                required: false,
                style: TextInputStyle.Paragraph,
                type: ComponentType.TextInput,
              },
            ],
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                custom_id: "links",
                label: "Links",
                max_length: 1_024,
                min_length: 1,
                placeholder: "The links for the bookmark separated by a space",
                required: false,
                style: TextInputStyle.Short,
                type: ComponentType.TextInput,
              },
            ],
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                custom_id: "target-message",
                label: "Target Message",
                min_length: 16,
                max_length: 20,
                placeholder: "The id of the target message",
                required: true,
                style: TextInputStyle.Short,
                type: ComponentType.TextInput,
                value: message.id,
              },
            ],
          },
        ],
      },
    });
  },
} as const;
