import express from "express";
import cors from "cors";
import helmet from "helmet";
import pkg from "pg";
import bodyParser from "body-parser"




const {Client}=pkg
let porta=4000

let app=express()
app.use(express.json({ limit: '10mb' }));

app.use(cors())
app.use(bodyParser.json({ limit: '10mb' })); 

const client = new Client({
    connectionString: "postgresql://shoes_x_owner:npg_wGSQCAXHs51c@ep-delicate-truth-a59lql4p-pooler.us-east-2.aws.neon.tech/shoes_x?sslmode=require",
    ssl: {
      rejectUnauthorized: false, // Para evitar problemas de SSL com o Neon
    },
  });
  
  client.connect()
    .then(() => console.log("Banco de dados conectado com sucesso!"))
    .catch(err => console.error("Erro ao conectar no banco:", err))
  

app.post("/procura",async (req,res)=>{
  let body=req.body
  let nome=body.nome
  let senha=body.senha
  console.log(nome,senha)
  let comando=`select * from usuarios where nome='${nome}'`
  const result=await client.query(comando)
  const veri=result.rows
  let tt=String(veri)
  let dados={
    ponto:"n"
  }

  if(tt==""){
    dados.ponto="s"
    comando=`insert into usuarios(nome,senha,coin) values(
      '${nome}','${senha}',1
    )`
    await client.query(comando)
  }
  res.json(dados)

})

app.post("/sapatos",async (req,res)=>{
  let body=req.body
  let nome=body.nome
  let senha=body.senha
  let comando=`select * from sapatos where usuarios='${nome}' and senha='${senha}' ORDER BY id DESC`
  const sapatos=await client.query(comando)
  const sapatos_=sapatos.rows
  res.json(sapatos_)
})

app.post("/change",async (req,res)=>{
  let body=req.body
  let comando=body.comando
  console.log(comando)

  const muda=await client.query(comando)
})

app.post("/vendas",async (req,res)=>{
  let body=req.body
  let {escolha,marca,modelo,nivel,preco,raridade,tamanho,unidade,caminho}=body
  console.log(escolha,marca,modelo,nivel,preco,raridade,tamanho,unidade,caminho)
  
  let comando=""
  if(escolha=="usuario"){

    let {usuario,senha}=body

    comando=`insert into sapatos(marca,modelo,nivel,raridade,quantidade, preco,tamanho,usuarios,senha,caminho,tipo) values('${marca}','${modelo}',${nivel},'${raridade}',${unidade},${preco},'${tamanho}','${usuario}','${senha}','${caminho}','usuario')`
    client.query(comando)
    console.log("passou")
  }
  else{

    let {loja,local,senha}=body

    let permi=`select id from cadastro_loja where nome='${loja}' and senha='${senha}'`

    const val=await client.query(permi)
    let valor=JSON.stringify(val.rows)
    console.log(valor)

    if(String(valor)!='[]'){
      const comando = `INSERT INTO sapatos (marca, modelo, nivel, raridade, quantidade, preco, tamanho, usuarios, localizacao, loja, caminho,tipo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

      const valores = [marca, modelo, nivel, raridade, unidade, preco, tamanho, loja, local,loja,caminho,"loja"];

      // Executando a consulta com os parâmetros
      await client.query(comando, valores);
    }
    else{
      let obj={
        deci:"n"
      }
      res.json(obj)
    }
  }
})

app.post("/login",async (req,res)=>{
  let body=req.body
  let nome=body.nome
  let senha=body.senha
  console.log(nome,senha)

  let comando=`select * from usuarios where nome='${nome}' and senha='${senha}'`
  const usuario=await client.query(comando)
  const data=usuario.rows
  console.log(data)
  res.json(data)
})


export default app
