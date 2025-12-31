const express = require('express');
const app = express();
require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    MessageFlags 
} = require('discord.js');

const port = process.env.PORT || 3000;
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// --- 1. EXPRESS HEARTBEAT (Top priority for Render) ---
app.get('/', (req, res) => res.send('Jacebot is awake! 🤖'));
app.listen(port, '0.0.0.0', () => {
    console.log(`🔗 Web server active on port: ${port}`);
});

// --- 2. BOT CLIENT SETUP ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// --- 3. DATA & COMMANDS ---
const jokes = ["Why do programmers prefer dark mode? Because light attracts bugs! 🐛"]; // (Keep your full lists here)
const eightBall = ["It is certain.", "My sources say no."];
const memes = ["https://i.imgflip.com/1ur9b0.jpg"];

const commands = [
    new SlashCommandBuilder().setName('help').setDescription('Lists all Jacebot commands'),
    new SlashCommandBuilder().setName('joke').setDescription('Get a cheesy joke'),
    new SlashCommandBuilder().setName('say').setDescription('Make Jacebot say something')
        .addStringOption(o => o.setName('say').setDescription('The message').setRequired(true)),
    // ... add back your other commands exactly as you had them ...
].map(command => command.toJSON());

// --- 4. THE READY EVENT (Fixed Typo) ---
client.once('ready', async () => {
    console.log(`✨ Success! Online as ${client.user.tag}`);

    // Deploy commands ONLY after the bot is safely online
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('🔄 Refreshing slash commands...');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ Slash commands registered!');
    } catch (error) {
        console.error('❌ Deployment Error:', error);
    }
});

// --- 5. INTERACTION HANDLER ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    try {
        if (commandName === 'joke') {
            await interaction.reply(jokes[Math.floor(Math.random() * jokes.length)]);
        }
        else if (commandName === 'say') {
            const message = interaction.options.getString('say');
            await interaction.reply({ content: '🗣️', ephemeral: true });
            await interaction.channel.send({ content: message, allowedMentions: { parse: [] } });
        }
        // ... add back your other logic ...
    } catch (error) {
        console.error(error);
        if (!interaction.replied) await interaction.reply({ content: '❌ Error!', flags: [MessageFlags.Ephemeral] });
    }
});

// --- 6. LOGIN ---
console.log("⏳ Attempting to log into Discord...");
client.login(TOKEN).catch(err => console.error("❌ Login failed:", err));
