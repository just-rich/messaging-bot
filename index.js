const { Client, GatewayIntentBits, ChannelType, Partials, EmbedBuilder } = require("discord.js");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel], // Required to fetch DMs that the bot hasn't sent messages to
});

client.on("ready", async () => {
  console.log(`${client.user.tag} is logged in and ready.`);
  try {
    const guild = await client.guilds.fetch(config.guildId);
    const channel = await client.channels.fetch(config.logChannel);
    console.log(`DMs will be relayed to: #${channel.name} in ${guild.name}`);
  } catch (error) {
    console.error(`Error fetching guild or channel: ${error.message}`);
  }
});

// Handle all DMs and relay to logChannel
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bot messages
  if (message.channel.type === ChannelType.DM) { // Check if it's a DM
    try {
      const logChannel = await client.channels.fetch(config.logChannel);
      if (!logChannel) {
        console.error(
          `Received DM from ${message.author.username} (${message.author.id}): ${message.content} | ERROR: Couldn't relay DM into logChannel, likely missing permissions or channel ID does not exist!`
        );
        return;
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(message.content || "*No content*")
        .setFooter({ text: `User ID: ${message.author.id}` })
        .setColor("#1dbac5")
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      console.log(
        `Received DM from ${message.author.username} (${message.author.id}): ${message.content} | Relayed DM to #${logChannel.name}`
      );
    } catch (err) {
      console.error(
        `Received DM from ${message.author.username} (${message.author.id}): ${message.content} | ERROR: Couldn't relay DM into logChannel, likely missing permissions or channel ID does not exist!`
      );
    }
  }

  // Command handling
  const prefix = config.commandPrefix;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Ignore bot messages for command handling
  if (message.author.bot) return;

  try {
    switch (command) {
      case "senddm": {
        const user = message.mentions.users.first(); // Get mentioned user
        const content = args.slice(1).join(" "); // Get content after the command

        if (!user || !content) {
          return message.reply("You must specify a user and message content.");
        }

        try {
          await user.send(content); // Send DM
          console.log(`Sent DM to ${user.tag} (${user.id}): ${content}`);
        } catch (err) {
          console.error(`Error sending DM to ${user.tag} (${user.id}): ${err.message}`);
          message.reply(`Error sending DM to ${user.tag}`);
        }
        break;
      }

      case "sendmsg": {
        const channel = message.mentions.channels.first(); // Get mentioned channel
        const content = args.slice(1).join(" "); // Get content after the command

        if (!channel || !content) {
          return message.reply("You must specify a channel and message content.");
        }

        try {
          await channel.send(content); // Send message to channel
          console.log(`Sent message to #${channel.name}: ${content}`);
        } catch (err) {
          console.error(`Error sending message to #${channel.name}: ${err.message}`);
          message.reply(`Error sending message to #${channel.name}`);
        }
        break;
      }

      default:
        message.reply("Unknown command. Use `<prefix>senddm` or `<prefix>sendmsg`.");
        break;
    }
  } catch (err) {
    console.error(`Error processing command: ${err.message}`);
    message.reply("An error occurred while processing the command.");
  }
});

// Slash command handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'sendmsgembed') {
    const channel = options.getChannel('channel');
    const author = options.getString('author');
    const authorImage = options.getString('author_image');
    const title = options.getString('title');
    const description = options.getString('description');
    const image = options.getString('image');
    const footer = options.getString('footer');
    const footerImage = options.getString('footer_image');

    // Build the embed
    const embed = new EmbedBuilder()
      .setColor("#1dbac5")
      .setTimestamp();

    if (author) embed.setAuthor({ name: author, iconURL: authorImage || null });
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (image) embed.setImage(image);
    if (footer || footerImage) {
      embed.setFooter({ text: footer || 'NVSTly.com', iconURL: footerImage || 'https://cdn.nvstly.com/static/avatar.png' });
    } else {
      embed.setFooter({ text: 'NVSTly.com', iconURL: 'https://cdn.nvstly.com/static/avatar.png' });
    }

    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({ content: `Embed sent to ${channel}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Error sending embed.', ephemeral: true });
    }
  }

  if (commandName === 'senddmembed') {
    const user = options.getUser('user');
    const author = options.getString('author');
    const authorImage = options.getString('author_image');
    const title = options.getString('title');
    const description = options.getString('description');
    const image = options.getString('image');
    const footer = options.getString('footer');
    const footerImage = options.getString('footer_image');

    // Build the embed
    const embed = new EmbedBuilder()
      .setColor("#1dbac5")
      .setTimestamp();

    if (author) embed.setAuthor({ name: author, iconURL: authorImage || null });
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (image) embed.setImage(image);
    if (footer || footerImage) {
      embed.setFooter({ text: footer || 'NVSTly.com', iconURL: footerImage || 'https://cdn.nvstly.com/static/avatar.png' });
    } else {
      embed.setFooter({ text: 'NVSTly.com', iconURL: 'https://cdn.nvstly.com/static/avatar.png' });
    }

    try {
      await user.send({ embeds: [embed] });
      await interaction.reply({ content: `Embed sent to ${user.tag}`, ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Error sending embed.', ephemeral: true });
    }
  }
});

client.login(config.token);
