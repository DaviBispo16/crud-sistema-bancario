const { readFile, writeFile } = require("fs/promises");
const { format } = require("date-fns");
module.exports = {
    depositar: async (req, res) => {
        const { numero_conta, valor } = req.body;
        try {
            const dados = JSON.parse(await readFile("src/data/bancodedados.json"));
            const { contas, depositos } = dados;
            const contaSelecionada = contas.find((contas) => { return contas.numero === numero_conta });
            if (!contaSelecionada) {
                return res.status(404).json({ mensagem: "Conta bancária informada inexistente!" });
            }
            contaSelecionada.saldo += valor;
            depositos.push({ data: format(new Date(), "yyyy-MM-dd HH:mm:ss"), numero_conta, valor });
            await writeFile("./src/data/bancodedados.json", JSON.stringify(dados));

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` });
        }
    },

    sacar: async (req, res) => {
        const { numero_conta, valor, senha } = req.body;
        try {
            const dados = JSON.parse(await readFile("./src/data/bancodedados.json"));
            const { contas, saques } = dados;
            const contaSelecionada = contas.find((conta) => { return conta.numero === numero_conta });
            if (!contaSelecionada) {
                return res.status(404).json({ mensagem: "Conta bancária informada inexistente!" });
            }
            if (contaSelecionada.usuario.senha !== senha) {
                return res.status(400).json({ mensagem: "Senha inválida para essa conta!" });
            }

            if (contaSelecionada.saldo < valor) {
                return res.status(400).json({ mensagem: "O saldo insuficiente para saque!" });
            }
            contaSelecionada.saldo -= valor;
            saques.push({ data: format(new Date(), "yyyy-MM-dd HH:mm:ss"), numero_conta, valor });
            await writeFile("src/data/bancodedados.json", JSON.stringify(dados));

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` })
        }
    },

    transferir: async (req, res) => {
        const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
        try {
            const dados = JSON.parse(await readFile("./src/data/bancodedados.json"));
            const { contas, transferencias } = dados;
            let contaOrigem = contas.find((conta) => { return conta.numero === numero_conta_origem });
            let contaDestino = contas.find((conta) => { return conta.numero === numero_conta_destino });
            if (!contaOrigem || !contaDestino) {
                return res.status(404).json({ mensagem: " O numero_conta_origem ou numero_conta_destino informado não existe!" });
            }

            if (contaOrigem.usuario.senha !== senha) {
                return res.status(404).json({ mensagem: "Senha inválida para a conta de origem informada!" });
            }
            if (valor > contaOrigem.saldo) {
                return res.status(404).json({ mensagem: "Saldo insuficiente!" })
            }
            contaOrigem.saldo -= valor;
            contaDestino.saldo += valor;
            transferencias.push({ data: format(new Date(), "yyyy-MM-dd HH:mm:ss"), numero_conta_origem, numero_conta_destino, valor });
            await writeFile("src/data/bancodedados.json", JSON.stringify(dados));

            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` });
        }
    }
}
