# 🏛️ SmartTender: Web3 Government Procurement

SmartTender is a next-generation decentralized application (dApp) designed to eliminate corruption, ensure absolute transparency, and cryptographically secure financial bids in government and enterprise procurement. 

By leveraging Ethereum smart contracts, IPFS decentralized storage, and a cryptographically enforced **Two-Envelope Commit-Reveal** bidding scheme, SmartTender guarantees that technical evaluations are performed completely blind to financial influences.

---

## ✨ Core Features

### 🔒 Cryptographic Bid Secrecy (Commit-Reveal)
Contractors submit a Keccak256 hash of their financial bid along with a secret salt. The actual bid amount remains mathematically hidden on the blockchain until the Admin whitelists their technical proposal, preventing competitors from underbidding.

### 📁 Decentralized Document Storage (IPFS)
All official government notices and contractor architectural blueprints (PDFs) are uploaded directly to the InterPlanetary File System (IPFS) via Pinata, ensuring documents are immutable and tamper-proof.

### ⏱️ Blockchain-Enforced Timers
Procurement phases (Bidding Window, Reveal Window, and Award Phase) are strictly enforced by block timestamps. Bidders cannot submit late, and administrators are mathematically prohibited from evaluating documents or peeking at bids early.

### 💰 Automated EMD Escrow
Contractors must lock an Earnest Money Deposit (EMD) in the smart contract to participate. Once the contract is officially awarded, the winner's EMD is locked as a performance guarantee, while losing and disqualified bidders can safely withdraw their ETH.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS (Custom Enterprise Dark Theme)
* **Web3 Integration:** Wagmi, Viem, RainbowKit
* **Smart Contracts:** Solidity (Deployed on Sepolia Testnet)
* **Decentralized Storage:** IPFS (via Pinata API)
* **Icons:** Lucide-React

---

## 🏛️ The Two-Envelope Architecture

The platform rigidly enforces the standard government Two-Envelope procurement method:

1.  **Phase 1: Tender Creation (Admin)**
    * The Administrator creates a tender, uploads the official requirement PDF to IPFS, and sets strict duration timers for Bidding and Revealing.
2.  **Phase 2: Bidding / Commit Phase (Contractor)**
    * Contractors upload their technical execution plan (PDF) to IPFS.
    * They lock their secret financial bid and password (salt) using local browser storage and send the cryptographic hash to the blockchain along with their EMD in ETH.
3.  **Phase 3: Technical Evaluation (Admin)**
    * Once the Bidding phase ends, the Admin uses the **Evaluator's Dashboard** to directly look up contractor submissions.
    * The Admin reviews the IPFS PDFs and explicitly whitelists technically qualified bidders on the blockchain. 
4.  **Phase 4: Financial Reveal (Contractor)**
    * Only whitelisted contractors are permitted to reveal their financial bids by submitting their exact unhashed amount and salt. The smart contract validates the hash perfectly.
5.  **Phase 5: Award & Escrow Resolution (Admin)**
    * The Admin officially awards the contract to the lowest mathematically verified bidder. Losers withdraw their EMDs.

---

## ⚙️ Getting Started (Local Development)

### 1. Prerequisites
Ensure you have **Node.js** installed and a Web3 wallet (like **MetaMask**) configured for the Sepolia Testnet.

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Pinata JWT for IPFS uploads:
```env
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here

```

### 3. Installation

Clone the repository and install the dependencies:

```bash
git clone [https://github.com/yourusername/SmartTender.git](https://github.com/yourusername/SmartTender.git)
cd SmartTender
npm install

```

### 4. Run the Development Server

```bash
npm run dev

```

Navigate to `http://localhost:3000` to view the application.

