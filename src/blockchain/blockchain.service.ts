// certificate.service.ts
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

// ABI completo do contrato
const CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "certId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      }
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "certificates",
    "outputs": [
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "courseName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "institution",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "issueDate",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "certificateHash",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certId",
        "type": "bytes32"
      }
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "studentName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "courseName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "institution",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "issueDate",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "certificateHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
          }
        ],
        "internalType": "struct CertificateRegistry.Certificate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "courseName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "institution",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "uniqueId",
        "type": "string"
      }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "certId",
        "type": "bytes32"
      }
    ],
    "name": "verifyCertificate",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0x5c5897924355c68E09F4191A1d3FCAF5c8807231';

interface Certificate {
  studentName: string;
  courseName: string;
  institution: string;
  issueDate: number;
  certificateHash: string;
  issuer: string;
}

interface IssueCertificateDto {
  studentName: string;
  courseName: string;
  institution: string;
  uniqueId: string;
}

@Injectable()
export class CertificateService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    // Configurar provider (exemplo com rede local ou testnet)
    this.provider = new ethers.JsonRpcProvider(
      process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:7545'
    );

    // Configurar wallet com private key
    this.wallet = new ethers.Wallet(
      "0x819e8299b831121e98bada0f503336188f339e91c10c1059de83feac265cd544",
      this.provider
    );

    // Instanciar contrato com o endereço correto
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      this.wallet
    );
  }

  // Registrar certificado na blockchain
  async issueCertificate(dto: IssueCertificateDto) {
    try {
      const tx = await this.contract.issueCertificate(
        dto.studentName,
        dto.courseName,
        dto.institution,
        dto.uniqueId
      );

      const receipt = await tx.wait();

      // Extrair o certId do evento emitido
      const iface = new ethers.Interface(CONTRACT_ABI);
      let certId = null;

      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });
          
          if (parsed && parsed.name === 'CertificateIssued') {
            certId = parsed.args.certId;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      return {
        success: true,
        transactionHash: receipt.hash,
        certId,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }

  // Listar todos os certificados através dos eventos
  async getAllCertificates() {
    try {
      const filter = this.contract.filters.CertificateIssued();
      const events = await this.contract.queryFilter(filter);

      const certificates = await Promise.all(
        events.map(async (event: any) => {
          const certId = event.args.certId;
          const issuer = event.args.issuer;

          try {
            const cert = await this.contract.getCertificate(certId);
            
            return {
              certId,
              studentName: cert.studentName,
              courseName: cert.courseName,
              institution: cert.institution,
              issueDate: new Date(Number(cert.issueDate) * 1000).toISOString(),
              certificateHash: cert.certificateHash,
              issuer: cert.issuer,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
            };
          } catch {
            return null;
          }
        })
      );

      return certificates.filter(cert => cert !== null);
    } catch (error) {
      throw new Error(`Failed to fetch certificates: ${error.message}`);
    }
  }

  // Verificar um certificado específico
  async verifyCertificate(certId: string) {
    try {
      const exists = await this.contract.verifyCertificate(certId);
      
      if (!exists) {
        return { exists: false };
      }

      const cert = await this.contract.getCertificate(certId);

      return {
        exists: true,
        certificate: {
          studentName: cert.studentName,
          courseName: cert.courseName,
          institution: cert.institution,
          issueDate: new Date(Number(cert.issueDate) * 1000).toISOString(),
          certificateHash: cert.certificateHash,
          issuer: cert.issuer,
        },
      };
    } catch (error) {
      throw new Error(`Failed to verify certificate: ${error.message}`);
    }
  }

  // Gerar certId da mesma forma que o contrato
  generateCertId(studentName: string, courseName: string, institution: string, uniqueId: string): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'string', 'string'],
        [studentName, courseName, institution, uniqueId]
      )
    );
  }
}