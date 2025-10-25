const { ethers } = require("ethers");
const solc = require("solc");
const fs = require("fs");

const source = fs.readFileSync("contract.sol", "utf8");

const input = {
  language: "Solidity",
  sources: {
    "contract.sol": {
      content: source,
    },
  },
  settings: {
    evmVersion: "paris", // ✅ Força compatibilidade com Ganache
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach((err) => {
    if (err.severity === "error") {
      console.error("❌ Erro:", err.formattedMessage);
      process.exit(1);
    } else {
      console.warn("⚠️  Aviso:", err.formattedMessage);
    }
  });
}

const contractName = "CertificateRegistry";
const contract = output.contracts["contract.sol"][contractName];

if (!contract) {
  console.error("❌ Contrato não encontrado! Verifique o nome.");
  process.exit(1);
}

const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
const wallet = new ethers.Wallet(
  "0x819e8299b831121e98bada0f503336188f339e91c10c1059de83feac265cd544",
  provider
);

async function deploy() {
  console.log("🚀 Fazendo deploy do contrato...");

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  const contract = await factory.deploy({ gasLimit: 5000000 });

  console.log("⏳ Aguardando confirmação...");
  await contract.waitForDeployment();

  console.log("✅ Contrato deployado em:", contract.target);

  fs.writeFileSync(
    "contractData.json",
    JSON.stringify({ address: contract.target, abi }, null, 2)
  );
}

deploy().catch(console.error);