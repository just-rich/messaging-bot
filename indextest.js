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

      case "sendmsgembed": {
        const channel = message.mentions.channels.first(); // Get mentioned channel
        const options = parseEmbedOptions(args.slice(1)); // Parse the arguments starting from index 1

        if (!channel) {
          return message.reply("You must specify a channel.");
        }

        try {
          // Debug log to check options
          console.log("Embed options: ", options);

          const embed = new EmbedBuilder()
            .setColor("#1dbac5")
            .setTimestamp()
            .setAuthor({
              name: options.author,
              iconURL: isValidImageUrl(options.authorimg) ? options.authorimg : null,
            })
            .setTitle(options.title || null)
            .setDescription(options.description || null)
            .setImage(isValidImageUrl(options.image) ? options.image : null)
            .setFooter({
              text: options.footer || "NVSTly.com",
              iconURL: isValidImageUrl(options.footerimg) ? options.footerimg : null,
            });

          await channel.send({ embeds: [embed] });
          console.log(`Sent embed to #${channel.name}`);
          message.reply("Embed successfully sent!");
        } catch (err) {
          console.error(`Error sending embed to #${channel.name}: ${err.message}`);
          message.reply("Error sending embed to channel.");
        }
        break;
      }

      case "senddmembed": {
        const user = message.mentions.users.first(); // Get mentioned user
        const options = parseEmbedOptions(args.slice(1)); // Parse the arguments starting from index 1

        if (!user) {
          return message.reply("You must specify a user.");
        }

        try {
          const embed = new EmbedBuilder()
            .setColor("#1dbac5")
            .setTimestamp()
            .setAuthor({
              name: options.author,
              iconURL: isValidImageUrl(options.authorimg) ? options.authorimg : null,
            })
            .setTitle(options.title || null)
            .setDescription(options.description || null)
            .setImage(isValidImageUrl(options.image) ? options.image : null)
            .setFooter({
              text: options.footer || "NVSTly.com",
              iconURL: isValidImageUrl(options.footerimg) ? options.footerimg : null,
            });

          await user.send({ embeds: [embed] });
          console.log(`Sent embed to ${user.tag}`);
          message.reply("Embed successfully sent!");
        } catch (err) {
          console.error(`Error sending embed to ${user.tag}: ${err.message}`);
          message.reply("Error sending embed to user.");
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

// Helper function to parse embed options from command arguments
function parseEmbedOptions(args) {
  const options = {
    author: null,
    authorimg: null,
    title: null,
    description: null,
    image: null,
    footer: null,
    footerimg: null,
  };

  let currentKey = null;
  let currentValue = [];

  args.forEach((arg) => {
    if (arg.includes(":")) {
      if (currentKey) {
        options[currentKey] = currentValue.join(" ");
      }

      const [key, ...valueParts] = arg.split(":");
      if (key in options) {
        currentKey = key;
        // Join the value parts back together in case the value contains additional colons
        currentValue = [valueParts.join(":").replace(/^['"]|['"]$/g, "")];
      }
    } else if (currentKey) {
      currentValue.push(arg);
    }
  });

  if (currentKey) {
    options[currentKey] = currentValue.join(" ");
  }

  return options;
}

// Helper function to validate image URLs (basic)
function isValidImageUrl(url) {
  const regex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp))/i;
  return regex.test(url);
}

client.login(config.token);
