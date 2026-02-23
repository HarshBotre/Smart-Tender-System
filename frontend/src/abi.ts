export const tenderABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "tenders",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "metadataURI", "type": "string" },
      { "internalType": "uint256", "name": "emdAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "biddingEndTimestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "revealEndTimestamp", "type": "uint256" },
      { "internalType": "bool", "name": "isOpen", "type": "bool" },
      { "internalType": "address", "name": "lowestBidder", "type": "address" },
      { "internalType": "uint256", "name": "lowestBidAmount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "bids",
    "outputs": [
      { "internalType": "string", "name": "technicalDocURI", "type": "string" },
      { "internalType": "bytes32", "name": "commitment", "type": "bytes32" },
      { "internalType": "bool", "name": "isTechnicallyValid", "type": "bool" },
      { "internalType": "bool", "name": "hasRevealed", "type": "bool" },
      { "internalType": "bool", "name": "hasWithdrawnEMD", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tenderCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_metadataURI", "type": "string" },
      { "internalType": "uint256", "name": "_emdAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "_biddingDuration", "type": "uint256" },
      { "internalType": "uint256", "name": "_revealDuration", "type": "uint256" }
    ],
    "name": "createTender",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_tenderId", "type": "uint256" },
      { "internalType": "string", "name": "_techURI", "type": "string" },
      { "internalType": "bytes32", "name": "_commitment", "type": "bytes32" }
    ],
    "name": "submitCommitment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_tenderId", "type": "uint256" },
      { "internalType": "address[]", "name": "_approvedBidders", "type": "address[]" }
    ],
    "name": "evaluateTechnical",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_tenderId", "type": "uint256" },
      { "internalType": "uint256", "name": "_bidAmount", "type": "uint256" },
      { "internalType": "string", "name": "_secretSalt", "type": "string" }
    ],
    "name": "revealBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_tenderId", "type": "uint256" }
    ],
    "name": "awardContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_tenderId", "type": "uint256" }
    ],
    "name": "withdrawEMD",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];