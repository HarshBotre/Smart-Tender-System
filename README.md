Goal: Set up the "Smart Tender" project on your laptop.

1. Install Prerequisites (Do this first)
Before downloading the code, make sure you have these tools installed.

Node.js (LTS Version): [Download Here](https://nodejs.org/)

Git: [Download Here](https://git-scm.com/)

VS Code: [Download Here](https://code.visualstudio.com/)

MetaMask Extension: Add it to Chrome/Brave and create a wallet.

2. Get the Code
Open your terminal (Command Prompt or PowerShell) and run these commands to download our project:

PowerShell
# 1. Download the project repository
git clone https://github.com/HarshBotre/Smart-Tender-System.git

# 2. Go inside the folder
cd Smart-Tender-System

3. Install Dependencies (The Magic Step)
IMPORTANT: Do NOT run npx hardhat init. Harsh has already set up the versions. You just need to download the libraries defined in package.json.

Run this command and wait for it to finish:

PowerShell
npm install

4. Set Up Your Secrets
The file that holds private keys (.env) is hidden for security. You need to create your own local copy.

# 1. Open the project in VS Code (code .).

# 2. In the file explorer (left side), right-click in the empty space and select New File.

# 3. Name it: .env

# 4. Paste this inside the file:

# We will fill these in later when we deploy to a real testnet
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR-API-KEY"
PRIVATE_KEY="0000000000000000000000000000000000000000000000000000"
Save the file (Ctrl + S).

5. Verify Everything Works
To make sure your setup is perfect, try to compile the smart contract. Run this in your VS Code terminal:

PowerShell
npx hardhat compile
If you see: Compiled 1 Solidity file successfully (or "Nothing to compile"), you are ready! ✅

If you see an error: Post a screenshot in the group chat.
