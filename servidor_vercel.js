// api/index.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import pkg from "pg";
import bodyParser from "body-parser";
import serverless from "serverless-http"; // <- ESSENCIAL

const { Client } = pkg;

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

const client = new Client({
  connectionString: "postgresql://shoes_x_owner:npg_wGSQCAXHs51c@ep-delicate-truth-a59lql4p-pooler.us-east-2.aws.neon.tech/shoes_x?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log("DB conectado"))
  .catch(err => console.error("Erro ao conectar no DB:", err));

app.post("/api/procura", async (req, res) => {
  let { nome, senha } = req.body;
  const result = await client.query(`select * from usuarios where nome='${nome}'`);
  const dados = { ponto: result.rows.length === 0 ? "s" : "n" };

  if (dados.ponto === "s") {
    await client.query(`insert into usuarios(nome,senha,coin) values('${nome}','${senha}',1)`);
  }

  res.json(dados);
});

app.post("/api/sapatos", async (req, res) => {
  let { nome, senha } = req.body;
  const result = await client.query(`select * from sapatos where usuarios='${nome}' and senha='${senha}' ORDER BY id DESC`);
  res.json(result.rows);
});

app.post("/api/change", async (req, res) => {
  let { comando } = req.body;
  await client.query(comando);
  res.json({ status: "ok" });
});

app.post("/api/vendas", async (req, res) => {
  const { escolha, marca, modelo, nivel, preco, raridade, tamanho, unidade, caminho } = req.body;

  if (escolha === "usuario") {
    const { usuario, senha } = req.body;
    await client.query(`insert into sapatos(marca,modelo,nivel,raridade,quantidade, preco,tamanho,usuarios,senha,caminho,tipo) values('${marca}','${modelo}',${nivel},'${raridade}',${unidade},${preco},'${tamanho}','${usuario}','${senha}','${caminho}','usuario')`);
    res.json({ status: "ok" });
  } else {
    const { loja, local, senha } = req.body;
    const val = await client.query(`select id from cadastro_loja where nome='${loja}' and senha='${senha}'`);
    if (val.rows.length > 0) {
      const comando = `INSERT INTO sapatos (marca, modelo, nivel, raridade, quantidade, preco, tamanho, usuarios, localizacao, loja, caminho, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
      const valores = [marca, modelo, nivel, raridade, unidade, preco, tamanho, loja, local, loja, caminho, "loja"];
      await client.query(comando, valores);
      res.json({ status: "ok" });
    } else {
      res.json({ deci: "n" });
    }
  }
});

app.post("/api/login", async (req, res) => {
  let { nome, senha } = req.body;
  const result = await client.query(`select * from usuarios where nome='${nome}' and senha='${senha}'`);
  res.json(result.rows);
});

export default serverless(app); // <- ESSENCIAL!
