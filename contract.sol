// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateRegistry {
    
    struct Certificate {
        string studentName;       
        string courseName;      
        string institution;       
        uint256 issueDate;        
        bytes32 certificateHash;  
        address issuer;           
    }

    mapping(bytes32 => Certificate) public certificates;

    event CertificateIssued(bytes32 indexed certId, address indexed issuer);

    function issueCertificate(
        string memory studentName,
        string memory courseName,
        string memory institution,
        string memory uniqueId
    ) public {
        bytes32 certId = keccak256(abi.encodePacked(studentName, courseName, institution, uniqueId));

        require(certificates[certId].issueDate == 0, "Certificate already exists!");

        certificates[certId] = Certificate({
            studentName: studentName,
            courseName: courseName,
            institution: institution,
            issueDate: block.timestamp,
            certificateHash: certId,
            issuer: msg.sender
        });

        emit CertificateIssued(certId, msg.sender);
    }

    function verifyCertificate(bytes32 certId) public view returns (bool) {
        return certificates[certId].issueDate != 0;
    }

    function getCertificate(bytes32 certId) public view returns (Certificate memory) {
        require(certificates[certId].issueDate != 0, "Certificate not found!");
        return certificates[certId];
    }
}
