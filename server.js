const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const { GPTMAKER_TOKEN, GPTMAKER_AGENT_ID, PORT } = process.env;

if (!GPTMAKER_TOKEN || !GPTMAKER_AGENT_ID) {
  throw new Error("Variaveis GPTMAKER_TOKEN e GPTMAKER_AGENT_ID nao definido.");
};

console.log("TOKEN carregado? ", !!GPTMAKER_TOKEN);
console.log("AGENT ID carregado? ", !!GPTMAKER_AGENT_ID);

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/api/chat", async (req, res) => {
  try {
    console.log("Body recebido no /chat: ", req.body);
    const { message, contextId, chatName } = req.body;

    const payload = { contextId, prompt: message };
    console.log("Payload enviado ao GPTMaker: ", payload);

    const response = await fetch(
      `https://api.gptmaker.ai/v2/agent/${GPTMAKER_AGENT_ID}/conversation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GPTMAKER_TOKEN}`,
        },
        body: JSON.stringify({
          contextId,
          prompt: message,
          chatName,
        }),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    console.log(data);
    return res.json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao conversar com o agente",
    });
  }
});

app.listen(PORT, () =>{
    console.log("API rodando?!");
})