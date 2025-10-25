# 🚀 SinguHub Dev API

API desenvolvida em **NestJS** para integração entre **Stripe Checkout** e **Blockchain Ethereum** (via Ganache).  
O projeto permite criar sessões de pagamento, salvar certificados em blockchain e consultar certificados armazenados.

---

## 🧩 Tecnologias Principais

- **NestJS 11** — Framework Node.js modular e escalável  
- **Ethers.js** — Conexão e interação com contratos Solidity  
- **Solidity 0.8.x** — Linguagem para contratos inteligentes  
- **Ganache** — Blockchain local para testes  
- **Stripe API** — Geração de sessões de checkout  
- **Hardhat** — Build, teste e deploy dos contratos  
- **TypeScript** — Tipagem estática e segurança no desenvolvimento  

---

## 📁 Estrutura do Projeto

```
.
├── src/
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── blockchain/
│   │   ├── blockchain.controller.ts
│   │   ├── blockchain.service.ts
│   │   └── blockchain.dto.ts
│   └── package/
│       └── package.module.ts
├── contract.sol
├── buildContract.js
├── .env
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## ⚙️ Configuração do Ambiente

### 1️⃣ Pré-requisitos

- Node.js 18+
- NPM ou Yarn
- Ganache (GUI ou CLI)
- Conta Stripe com chave `SECRET_KEY`
- Hardhat instalado globalmente (`npm install -g hardhat`)

---

### 2️⃣ Clonar e instalar dependências

```bash
git clone https://github.com/seuusuario/singuhub-dev-api.git
cd singuhub-dev-api/test
npm install
```

---

### 3️⃣ Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto com:

```env
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
GANACHE_RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=0xSEU_PRIVATE_KEY_GANACHE
CONTRACT_ADDRESS=0xEnderecoContratoDepoisDoDeploy
```

---

## 🧠 Blockchain (Solidity + Hardhat + Ganache)

### 1️⃣ Compilar o contrato

O contrato está no arquivo `contract.sol`.

Para compilar manualmente:

```bash
npx hardhat compile
```

Ou via script `buildContract.js` (compila com `solc` e gera `contractData.json`):

```bash
node buildContract.js
```

---

### 2️⃣ Iniciar o Ganache

Abra o Ganache (GUI) ou CLI:

```bash
ganache --port 7545
```

Anote:
- O endereço RPC (ex: `http://127.0.0.1:7545`)
- Uma chave privada de uma conta

---

### 3️⃣ Fazer o Deploy do Contrato

Crie um script `deploy.js` (caso não exista) com:

```js
const { ethers } = require("ethers");
const fs = require("fs");
const contractData = require("./contractData.json");

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

(async () => {
  const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log("Contrato implantado em:", await contract.getAddress());
})();
```

Executar:
```bash
node deploy.js
```

Salve o endereço exibido em `.env` → `CONTRACT_ADDRESS`.

---

## 💳 Integração com Stripe

### 1️⃣ Criar sessão de checkout

**Rota:** `POST /checkout`

**Exemplo de requisição:**
```json
{
  "priceId": "price_123456789",
  "successUrl": "http://localhost:3000/success",
  "cancelUrl": "http://localhost:3000/cancel"
}
```

**Resposta:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

---

## 🔗 Rotas Blockchain

### 🪪 Salvar certificado

**Rota:** `POST /blockchain/certificate`

**Body:**
```json
{
  "id": "1234",
  "owner": "Joabe Borges",
  "data": "Certificado concluído em 2025-10-25"
}
```

**Retorno:**
```json
{
  "transactionHash": "0xabc123..."
}
```

---

### 🔍 Buscar certificado

**Rota:** `GET /blockchain/certificate/:id`

**Resposta:**
```json
{
  "id": "1234",
  "owner": "Joabe Borges",
  "data": "Certificado concluído em 2025-10-25"
}
```

---

## 🧪 Executar a Aplicação

### Ambiente de desenvolvimento

```bash
npm run start:dev
```

A API ficará disponível em:

```
http://localhost:3000
```

---

### Build de produção

```bash
npm run build
npm run start:prod
```

---

## 🖼️ Prints e Demonstrações

### 💻 Tela de Checkout Stripe
![alt text](image-1.png)
### 🧾 Certificado registrado na Blockchain
![alt text](image.png)
---

## 🧱 Estrutura Modular (NestJS)

| Módulo | Descrição |
|--------|------------|
| `AppModule` | Módulo raiz que carrega os demais |
| `BlockchainModule` | Lida com operações no contrato Solidity |
| `PackageModule` | Integração com Stripe e controle de checkout |

---

## 🧰 Scripts úteis

| Comando | Descrição |
|----------|------------|
| `npm run start:dev` | Inicia o servidor em modo watch |
| `npm run build` | Compila o projeto |
| `npm run start:prod` | Executa a versão buildada |
| `node buildContract.js` | Compila o contrato Solidity |
| `node deploy.js` | Realiza o deploy no Ganache |
| `npm run lint` | Corrige formatação automática |
| `npm run test` | Executa testes unitários (Jest) |

---

## 🛡️ Boas Práticas

- Sempre utilize uma nova conta no Ganache para testes.
- Nunca compartilhe a `PRIVATE_KEY` publicamente.
- Teste o checkout com a [chave de teste da Stripe](https://stripe.com/docs/testing).

---

## 🧑‍💻 Autor

**Joabe Borges**  
Desenvolvedor Full Stack / Blockchain  
📧 contato: [joabe.conrado19@gmail.com]()

---



## 📂 Consultas de certificados Singuhub na blockchain


![alt text](image-2.png)
---

🟢 **Tudo pronto!**  
Agora você tem um backend NestJS integrado com Stripe e blockchain Ethereum rodando localmente com Ganache, e em produção validar hash de certificados com etherscan 🚀
