const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json'); // Load token, clientId, and guildId from config

const rest = new REST({ version: '10' }).setToken(token);

// Register slash commands
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Define slash commands
    const commands = [
      {
        name: 'sendmsgembed',
        description: 'Send an embed message to a channel.',
        options: [
          {
            type: 7, // CHANNEL type
            name: 'channel',
            description: 'Channel to send the embed to.',
            required: true,
          },
          {
            type: 3, // STRING type
            name: 'author',
            description: 'Author of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'author_image',
            description: 'URL of the author image.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'title',
            description: 'Title of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'description',
            description: 'Description of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'image',
            description: 'URL of the image.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'footer',
            description: 'Footer of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'footer_image',
            description: 'Footer image URL.',
            required: false,
          },
        ],
      },
      {
        name: 'senddmembed',
        description: 'Send an embed message to a user via DM.',
        options: [
          {
            type: 6, // USER type
            name: 'user',
            description: 'User to send the DM to.',
            required: true,
          },
          {
            type: 3, // STRING type
            name: 'author',
            description: 'Author of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'author_image',
            description: 'URL of the author image.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'title',
            description: 'Title of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'description',
            description: 'Description of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'image',
            description: 'URL of the image.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'footer',
            description: 'Footer of the embed.',
            required: false,
          },
          {
            type: 3, // STRING type
            name: 'footer_image',
            description: 'Footer image URL.',
            required: false,
          },
        ],
      },
    ];

    // Register commands globally for a guild (for testing)
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
