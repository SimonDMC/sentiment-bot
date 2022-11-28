const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token, apiKey } = require("./config.json");
const cohere = require("cohere-ai");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// log in
client.login(token);

// init cohere
cohere.init(apiKey);

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.channel.name != "sentiment") return;

    try {
        const response = await cohere.classify({
            model: "medium",
            inputs: [message.content],
            examples: [
                { text: "hiiii", label: "Positive" },
                { text: "this is so cool", label: "Positive" },
                { text: "omg", label: "Positive" },
                { text: "cant wait to call with you", label: "Positive" },
                { text: "wait that's crazy", label: "Positive" },
                { text: "oh absolutely", label: "Positive" },
                { text: "fabulous", label: "Positive" },
                { text: "lets goooooo", label: "Positive" },
                { text: "i am winning", label: "Positive" },
                { text: "hahahahaha", label: "Positive" },
                { text: ":D", label: "Positive" },
                { text: ":)", label: "Positive" },
                { text: "W", label: "Positive" },
                { text: "absolutely not", label: "Negative" },
                { text: "gtfo", label: "Negative" },
                { text: "shut up", label: "Negative" },
                { text: "this sucks", label: "Negative" },
                { text: "stop doing that", label: "Negative" },
                { text: "screw you", label: "Negative" },
                { text: "piss off", label: "Negative" },
                { text: "you are so annoying", label: "Negative" },
                { text: "i am losing", label: "Negative" },
                { text: "D:", label: "Negative" },
                { text: ":(", label: "Negative" },
                { text: "L", label: "Negative" },
            ],
        });

        const prediction = response.body.classifications[0].prediction;
        const confidence = response.body.classifications[0].confidence;

        if (prediction == "Positive") {
            message.react("😀");
        } else {
            message.react(confidence > 0.95 ? "😡" : "😦");
        }
    } catch (e) {}
});
