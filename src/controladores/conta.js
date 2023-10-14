const { readFile, writeFile } = require("fs/promises");
module.exports = {
    listarContasBancarias: async (req, res) => {
        try {
            const { contas } = JSON.parse(await readFile("./src/data/bancodedados.json"));
            return res.status(200).json(contas);
        } catch (erro) {
            return res.status(500).json({ mensagem: "Erro do servidor" });
        }
    },

    criarContaBancaria: async (req, res) => {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
        try {
            const dados = JSON.parse(await readFile("./src/data/bancodedados.json"));
            const { contas } = dados;
            let id = dados.identificador;
            dados.identificador++;
            const cpfInvalido = contas.find((conta) => { return conta.usuario.cpf == cpf; });
            const emailInvalido = contas.find((conta) => { return conta.usuario.email == email; });

            if (cpfInvalido) {
                return res.status(400).json({ mensagem: "O CPF informado já existe cadastrado!" });
            }
            if (emailInvalido) {
                return res.status(400).json({ mensagem: "O Email informado já existe cadastrado!" });
            }
            const conta = { numero: id, saldo: 0, usuario: { nome, cpf, data_nascimento, telefone, email, senha } }
            contas.push(conta);

            await writeFile("./src/data/bancodedados.json", JSON.stringify(dados));
            res.status(201).send();
        } catch (error) {
            res.status(500).json({ mensagem: `${error}` });
        }
    },

    atualizarUsuarioDaContaBancaria: async (req, res) => {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
        const numeroConta = Number(req.params.numeroConta);
        try {
            const dados = JSON.parse(await readFile("./src/data/bancodedados.json"));
            let { contas } = dados;
            const contaSelecionada = contas.find((conta) => { return conta.numero === numeroConta });
            if (!contaSelecionada) {
                return res.status(404).json({ mensagem: "O número da conta passado como parametro na URL não existe!" });
            }

            const cpfInvalido = contas.find((item) => { return item.usuario.cpf == cpf; });
            const emailInvalido = contas.find((item) => { return item.usuario.email == email; });
            if (cpfInvalido) {
                return res.status(400).json({ mensagem: "O CPF informado já existe cadastrado!" });
            }
            if (emailInvalido) {
                return res.status(400).json({ mensagem: "O Email informado já existe cadastrado!" });
            }

            contaSelecionada.usuario.nome = nome;
            contaSelecionada.usuario.cpf = cpf;
            contaSelecionada.usuario.data_nascimento = data_nascimento;
            contaSelecionada.usuario.telefone = telefone;
            contaSelecionada.usuario.email = email;
            contaSelecionada.usuario.senha = senha;

            await writeFile("./src/data/bancodedados.json", JSON.stringify(dados));
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` });
        }
    },

    excluirConta: async (req, res) => {
        const numeroConta = Number(req.params.numeroConta);
        try {
            const dados = JSON.parse(await readFile("./src/data/bancodedados.json"));
            const { contas } = dados;
            const contaSelecionada = contas.find((conta) => { return conta.numero === numeroConta })

            if (!contaSelecionada) {
                return res.status(404).json({ mensagem: "O número da conta passado como parametro na URL não existe!" });
            }
            if (contaSelecionada.saldo !== 0) {
                return res.status(400).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" });
            }

            dados.contas = dados.contas.filter((conta) => { return conta.numero !== numeroConta });
            await writeFile("./src/data/bancodedados.json", JSON.stringify(dados));
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` });
        }
    },

    saldo: async (req, res) => {
        const { numero_conta, senha } = req.query;
        try {
            const { contas } = JSON.parse(await readFile("./src/data/bancodedados.json"));
            const contaSelecionada = contas.find((conta) => { return conta.numero === Number(numero_conta) });
            if (!contaSelecionada) {
                return res.status(404).json({ mensagem: "Conta bancária não encontrada!" });
            }
            if (contaSelecionada.usuario.senha != senha) {
                return res.status(400).json({ mensagem: "Senha incorreta para essa conta!" });
            }

            return res.status(200).json({ Saldo: `${contaSelecionada.saldo}` });
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` });
        }
    },

    extrato: async (req, res) => {
        const { numero_conta, senha } = req.query;
        try {
            const dados = JSON.parse(await readFile("./src/data/bancodedados.json"));
            const { contas, saques, depositos, transferencias } = dados;
            const contaSelecionada = contas.find((conta) => { return conta.numero === Number(numero_conta) });
            if (!contaSelecionada) {
                return res.status(404).json({ mensagem: "Conta bancária não encontrada!" });
            }
            if (contaSelecionada.usuario.senha != senha) {
                return res.status(400).json({ mensagem: "Senha incorreta para essa conta!" });
            }

            const historicoSaques = saques.filter((saque) => { return saque.numero_conta === Number(numero_conta) });
            const historicoDepositos = depositos.filter((deposito) => { return deposito.numero_conta === Number(numero_conta) });
            const historicoTransferenciasEnviadas = transferencias.filter((transferencia) => { return transferencia.numero_conta_origem === Number(numero_conta) });
            const historicoTransferenciasRecebidas = transferencias.filter((transferencia) => { return transferencia.numero_conta_destino === Number(numero_conta) });
            const extrato = { depositos: historicoDepositos, saques: historicoSaques, transferenciasEnviadas: historicoTransferenciasEnviadas, transferenciasRecebidas: historicoTransferenciasRecebidas };

            return res.status(200).json(extrato);
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` });
        }
    }
}