const { Client, Events, GatewayIntentBits, Partials } = require("discord.js");
const cohere = require("cohere-ai");

// keep bot up
require('http').createServer((req, res) => res.end('Bot is alive!')).listen(3000)

const token = process.env['token'];
const apiKey = process.env['apiKey'];

const client = new Client({
  partials: [
    Partials.Channel,
    Partials.Message
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
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
  // take from sentiment channel or through dm
  console.log(message.guild)
  if (message.channel.name != "sentiment" && message.guild != null) return;

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
  } catch (e) { }
});