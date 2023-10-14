const { readFile } = require("fs/promises");
module.exports = {
    autenticacao: async (req, res, next) => {
        const { senha_banco } = req.query;
        try {
            const { banco } = JSON.parse(await readFile("./src/data/bancodedados.json"));
            const senhaCorreta = banco.senha;
            if (senha_banco == senhaCorreta) {
                return next();
            }
            return res.status(401).json({ mensagem: "A senha do banco informada é inválida!" });
        } catch (error) {
            return res.status(500).json({ mensagem: `${error}` });
        }
    },

    requisitoContaESenha: (req, res, next) => {
        const { numero_conta, senha } = req.query;
        if (!numero_conta || !senha) {
            return res.status(400).json({ mensagem: "O numero_conta e senha são obrigatórios!" })
        }
        return next();
    },

    requisitoDadosPessoais: (req, res, next) => {
        const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
        if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
            return res.status(400).json({ mensagem: "O servidor não entendeu a requisição pois está com uma sintaxe/formato inválido" });
        }
        return next();
    },

    requisitoValorEConta: (req, res, next) => {
        const { numero_conta, valor } = req.body;
        if (!numero_conta || !valor) {
            return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" });
        }
        return next();
    },

    valorNulo: (req, res, next) => {
        const { valor } = req.body;
        if (valor <= 0) {
            return res.status(400).json({ mensagem: "Não é permitido depósitos com valores negativos ou zerados!" });
        };
        return next();
    },

    requisitoConta_Valor_Senha: (req, res, next) => {
        const { numero_conta, valor, senha } = req.body;
        if (!numero_conta || !valor || !senha) {
            return res.status(400).json({ mensagem: "O número_conta, valor e senha são obrigatórios!" });
        }
        return next();
    },

    requisitoOrigem_Destino_valor_senha: (req, res, next) => {
        const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
        if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
            return res.status(400).json({ mensagem: "O numero_conta_origem, numero_conta_destino, valor e senha são obrigatórios." });
        }
        return next();
    },

    numeroContaOrigem_numeroContaDestino: (req, res, next) => {
        const { numero_conta_origem, numero_conta_destino } = req.body;
        if (numero_conta_origem === numero_conta_destino) {
            return res.status(400).json({ mensagem: "numero_conta_origem e numero_conta_destino não podem ser iguais!" });
        }
        return next();
    }

}