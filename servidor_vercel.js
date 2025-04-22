const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { Client } = require("pg");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));

const client = new Client({
  connectionString: "postgresql://shoes_x_owner:npg_wGSQCAXHs51c@ep-delicate-truth-a59lql4p-pooler.us-east-2.aws.neon.tech/shoes_x?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(() => console.log("DB conectado"))
  .catch((err) => {
    console.error("Erro ao conectar no DB:", err);
  });

app.post("/api/procura", async (req, res) => {
  try {
    const { nome, senha } = req.body;

    const result = await client.query("SELECT * FROM usuarios WHERE nome = $1", [nome]);
    const dados = { ponto: result.rows.length === 0 ? "s" : "n" };

    if (dados.ponto === "s") {
      await client.query(
        "INSERT INTO usuarios (nome, senha, coin) VALUES ($1, $2, $3)",
        [nome, senha, 1]
      );
    }

    res.json(dados);
  } catch (error) {
    console.error("Erro em /procura:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/sapatos", async (req, res) => {
  try {
    const { nome, senha } = req.body;
    const result = await client.query(
      "SELECT * FROM sapatos WHERE usuarios = $1 AND senha = $2 ORDER BY id DESC",
      [nome, senha]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro em /sapatos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/change", async (req, res) => {
  try {
    const { comando } = req.body;
    await client.query(comando); // CUIDADO: isso ainda pode ser perigoso se o "comando" vier de qualquer lugar
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Erro em /change:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/vendas", async (req, res) => {
  try {
    const { escolha, marca, modelo, nivel, preco, raridade, tamanho, unidade, caminho } = req.body;

    if (escolha === "usuario") {
      const { usuario, senha } = req.body;

      await client.query(
        "INSERT INTO sapatos (marca, modelo, nivel, raridade, quantidade, preco, tamanho, usuarios, senha, caminho, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [marca, modelo, nivel, raridade, unidade, preco, tamanho, usuario, senha, caminho, "usuario"]
      );

      res.json({ status: "ok" });
    } else {
      const { loja, local, senha } = req.body;

      const val = await client.query(
        "SELECT id FROM cadastro_loja WHERE nome = $1 AND senha = $2",
        [loja, senha]
      );

      if (val.rows.length > 0) {
        await client.query(
          "INSERT INTO sapatos (marca, modelo, nivel, raridade, quantidade, preco, tamanho, usuarios, localizacao, loja, caminho, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
          [marca, modelo, nivel, raridade, unidade, preco, tamanho, loja, local, loja, caminho, "loja"]
        );
        res.json({ status: "ok" });
      } else {
        res.json({ deci: "n" });
      }
    }
  } catch (error) {
    console.error("Erro em /vendas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { nome, senha } = req.body;
    const result = await client.query(
      "SELECT * FROM usuarios WHERE nome = $1 AND senha = $2",
      [nome, senha]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro em /login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = serverless(app);
