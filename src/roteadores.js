const express = require("express");
const endpoint = express.Router();
const { listarContasBancarias, criarContaBancaria, atualizarUsuarioDaContaBancaria, excluirConta, saldo, extrato } = require("./controladores/conta");
const { depositar, sacar, transferir } = require("./controladores/transacoes");
const { autenticacao, requisitoContaESenha, requisitoDadosPessoais, requisitoValorEConta, valorNulo, requisitoConta_Valor_Senha, requisitoOrigem_Destino_valor_senha, numeroContaOrigem_numeroContaDestino } = require("./intermediarios/requisitos");

endpoint.get("/contas", autenticacao, listarContasBancarias);
endpoint.post("/contas", requisitoDadosPessoais, criarContaBancaria);
endpoint.put("/contas/:numeroConta/usuario", requisitoDadosPessoais, atualizarUsuarioDaContaBancaria);
endpoint.delete("/contas/:numeroConta", excluirConta);
endpoint.post("/transacoes/depositar", requisitoValorEConta, valorNulo, depositar);
endpoint.post("/transacoes/sacar", requisitoConta_Valor_Senha, valorNulo, sacar);
endpoint.post("/transacoes/transferir", requisitoOrigem_Destino_valor_senha, numeroContaOrigem_numeroContaDestino, transferir);
endpoint.get("/contas/saldo", requisitoContaESenha, saldo);
endpoint.get("/contas/extrato", requisitoContaESenha, extrato);

module.exports = endpoint;