import type { APIEmbed, Message, Snowflake, User } from "discord.js";

export function createEmbed(): APIEmbed {
  return { color: 0x2f3136, timestamp: new Date().toISOString() };
}

type CreateBookmarkEmbedOptions = {
  creator: User;
  description: string;
  links: string;
  message: Message<true>;
  name: string;
};

export function createBookmarkEmbed(options: CreateBookmarkEmbedOptions): APIEmbed {
  const { creator, description, links, message, name } = options;

  const embed = { fields: [], ...messageToEmbed(message) };

  if (description) {
    embed.fields.push({ name: "Description", value: description });
  }

  if (links) {
    embed.fields.push({ name: "Links", value: links.split(" ").join("\n") });
  }

  embed.fields.push({ name: "Creator", value: `${creator} (${creator.id})` });

  if (name) {
    embed.title = name;
  }

  return embed;
}

export function extractCreatorIdFromBookmark(message: Message<true>): Snowflake | null {
  const fieldValue = message.embeds[0].fields.at(-1)?.value;

  if (!fieldValue) return null;

  const match = /\(.+\)/.exec(fieldValue);

  return match ? match[0].slice(1, -1) : null;
}

export function messageToEmbed(message: Message<true>): APIEmbed {
  const embed = {
    ...createEmbed(),
    author: {
      name: `${message.author.displayName} (${message.author.id})`,
      icon_url: message.author.displayAvatarURL(),
    },
    description: message.content,
    footer: {
      text: `#${message.channel.name}`,
    },
    timestamp: message.createdAt.toISOString(),
  };

  const attachments = message.attachments.filter(attachment => attachment.contentType?.startsWith("image"));
  const firstAttachment = attachments.first();

  return firstAttachment ? { ...embed, image: { url: firstAttachment.url } } : embed;
}
