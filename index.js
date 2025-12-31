const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
    console.log(`🔗 Web server is actually listening on port: ${port}`);
});

// --- 2. IMPORTS & CONFIG ---
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

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// --- 3. FUN DATA ---
const jokes = [
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "How many tickles does it take to make an octopus laugh? Ten tickles. 🐙",
    "Why did the scarecrow win an award? He was outstanding in his field. 🌾"
];

const quotes = [
    "The only way to do great work is to love what you do. – Steve Jobs",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "It always seems impossible until it's done. – Nelson Mandela"
];

const facts = [
    "Honey never spoils. Archaeologists found 3,000-year-old edible honey! 🍯",
    "Octopuses have three hearts. ❤️❤️❤️",
    "Bananas grow towards the sun. 🍌"
];

const eightBall = [
    "It is certain.",
    "Without a doubt.",
    "Ask again later.",
    "Better not tell you now.",
    "My sources say no."
];

const memes = [
    "https://i.imgflip.com/1ur9b0.jpg",
    "https://i.imgflip.com/26am.jpg",
    "https://i.imgflip.com/1g8my4.jpg"
];

// --- 4. SLASH COMMAND DEFINITIONS ---
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all Jacebot commands'),

    new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a die')
        .addIntegerOption(o =>
            o.setName('sides').setDescription('Number of sides (default 6)')
        ),

    new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(o =>
            o.setName('question')
             .setDescription('What do you want to know?')
             .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme'),

    new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a cheesy joke'),

    new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Get a motivational quote'),

    new SlashCommandBuilder()
        .setName('funfact')
        .setDescription('Get a random fun fact'),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Shows a users avatar')
        .addUserOption(o =>
            o.setName('target')
             .setDescription('The user to view')
             .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays server stats')
        .setDMPermission(false),

    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays info about a user')
        .addUserOption(o =>
            o.setName('target')
             .setDescription('The user to inspect')
             .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a simple poll')
        .addStringOption(o =>
            o.setName('question')
             .setDescription('The topic')
             .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('opt1')
             .setDescription('First option')
             .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('opt2')
             .setDescription('Second option')
             .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make Jacebot say something')
        .addStringOption(o =>
            o.setName('say')
             .setDescription('The message Jacebot will say')
             .setRequired(true)
        )
].map(command => command.toJSON());

// --- 5. DEPLOY COMMANDS ---
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Refreshing slash commands...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Slash commands registered!');
    } catch (error) {
        console.error(error);
    }
})();

// --- 6. INTERACTION HANDLER ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'help') {
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('Jacebot Help')
                .setDescription(
                    'I am your friendly neighborhood bot! Type `/` to see my commands.\n\n' +
                    'Highlights: `/joke`, `/poll`, `/roll`, `/meme`'
                );

            await interaction.reply({ embeds: [embed] });
        }

        else if (commandName === 'roll') {
            const sides = interaction.options.getInteger('sides') || 6;
            const res = Math.floor(Math.random() * sides) + 1;
            await interaction.reply(`🎲 Rolling a d${sides}... You got a **${res}**!`);
        }

        else if (commandName === '8ball') {
            const ans = eightBall[Math.floor(Math.random() * eightBall.length)];
            await interaction.reply(`🎱 **The 8-Ball says:** ${ans}`);
        }

        else if (commandName === 'joke') {
            await interaction.reply(jokes[Math.floor(Math.random() * jokes.length)]);
        }

        else if (commandName === 'meme') {
            await interaction.reply(memes[Math.floor(Math.random() * memes.length)]);
        }

        else if (commandName === 'quote') {
            await interaction.reply(`✨ ${quotes[Math.floor(Math.random() * quotes.length)]}`);
        }

        else if (commandName === 'funfact') {
            await interaction.reply(`🧠 **Did you know?** ${facts[Math.floor(Math.random() * facts.length)]}`);
        }

        else if (commandName === 'avatar') {
            const user = interaction.options.getUser('target');
            await interaction.reply(
                user.displayAvatarURL({ size: 512, dynamic: true })
            );
        }

        else if (commandName === 'serverinfo') {
            if (!interaction.guild) return;

            const embed = new EmbedBuilder()
                .setTitle(`🏠 ${interaction.guild.name}`)
                .setColor(0x2ECC71)
                .addFields(
                    { name: 'Members', value: `${interaction.guild.memberCount}`, inline: true },
                    { name: 'Created', value: interaction.guild.createdAt.toDateString(), inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        }

        else if (commandName === 'userinfo') {
            const user = interaction.options.getUser('target');

            const embed = new EmbedBuilder()
                .setTitle(`👤 ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'Account Created', value: user.createdAt.toDateString() }
                );

            await interaction.reply({ embeds: [embed] });
        }

        // ✅ FIXED /say COMMAND
        else if (commandName === 'say') {
            const message = interaction.options.getString('say');

            // Silent acknowledgement
            await interaction.reply({
                content: '🗣️',
                ephemeral: true
            });

            // Bot speaks normally
            await interaction.channel.send({
                content: message,
                allowedMentions: { parse: [] }
            });
        }

        else if (commandName === 'poll') {
            const q = interaction.options.getString('question');
            const o1 = interaction.options.getString('opt1');
            const o2 = interaction.options.getString('opt2');

            const embed = new EmbedBuilder()
                .setTitle('📊 New Poll!')
                .setDescription(`**${q}**\n\n1️⃣ ${o1}\n2️⃣ ${o2}`)
                .setColor(0xF1C40F);

            const msg = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            await msg.react('1️⃣');
            await msg.react('2️⃣');
        }

    } catch (error) {
        console.error(error);

        const errorMsg = {
            content: '❌ There was an error executing this command!',
            flags: [MessageFlags.Ephemeral]
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMsg);
        } else {
            await interaction.reply(errorMsg);
        }
    }
});

// --- 7. READY EVENT ---
client.once('clientReady', () => {
    console.log(`✨ Success! Online as ${client.user.tag}`);
});

client.login(TOKEN);
