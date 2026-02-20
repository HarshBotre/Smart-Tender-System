const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SecureTender Workflow Simulation", function () {
  let secureTender;
  let admin, bidder1, bidder2;
  
  // Tender Variables
  const tenderId = 1;
  const emdAmount = ethers.parseEther("1"); // 1 ETH deposit
  const biddingDuration = 3600; // 1 hour in seconds
  const revealDuration = 3600;  // 1 hour in seconds

  // Bidder 1 (Loser - High Price)
  const bid1Amount = ethers.parseEther("10"); 
  const salt1 = "secretPassword1";
  let hash1;

  // Bidder 2 (Winner - Low Price)
  const bid2Amount = ethers.parseEther("5"); 
  const salt2 = "secretPassword2";
  let hash2;

  before(async function () {
    // 1. Get the "wallets" for testing
    [admin, bidder1, bidder2] = await ethers.getSigners();

    // 2. Deploy the contract
    const SecureTender = await ethers.getContractFactory("SecureTender");
    secureTender = await SecureTender.deploy();

    // 3. Generate the hashes locally (just like the frontend will do)
    hash1 = ethers.solidityPackedKeccak256(["uint256", "string"], [bid1Amount, salt1]);
    hash2 = ethers.solidityPackedKeccak256(["uint256", "string"], [bid2Amount, salt2]);
  });

  it("Step 1: Admin creates a tender", async function () {
    await secureTender.connect(admin).createTender(
      "ipfs://tender-document-link",
      emdAmount,
      biddingDuration,
      revealDuration
    );

    const tender = await secureTender.tenders(tenderId);
    expect(tender.isOpen).to.equal(true);
    expect(tender.emdAmount).to.equal(emdAmount);
  });

  it("Step 2: Bidders submit their hidden commitments with EMD", async function () {
    // Bidder 1 connects and pays 1 ETH EMD
    await secureTender.connect(bidder1).submitCommitment(tenderId, "ipfs://tech-doc-1", hash1, { value: emdAmount });
    
    // Bidder 2 connects and pays 1 ETH EMD
    await secureTender.connect(bidder2).submitCommitment(tenderId, "ipfs://tech-doc-2", hash2, { value: emdAmount });

    const bid1 = await secureTender.bids(tenderId, bidder1.address);
    expect(bid1.commitment).to.equal(hash1);
  });

  it("Step 3: Fast forward time to end the bidding phase", async function () {
    // We use Hardhat's time-travel feature to move 1 hour into the future
    await time.increase(biddingDuration + 1);
  });

  it("Step 4: Admin evaluates and approves technical documents", async function () {
    // Admin approves both bidders off-chain and updates the contract
    await secureTender.connect(admin).evaluateTechnical(tenderId, [bidder1.address, bidder2.address]);

    const bid1 = await secureTender.bids(tenderId, bidder1.address);
    expect(bid1.isTechnicallyValid).to.equal(true);
  });

  it("Step 5: Bidders reveal their actual prices", async function () {
    await secureTender.connect(bidder1).revealBid(tenderId, bid1Amount, salt1);
    await secureTender.connect(bidder2).revealBid(tenderId, bid2Amount, salt2);

    const tender = await secureTender.tenders(tenderId);
    // Because Bidder 2 bid 5 ETH and Bidder 1 bid 10 ETH, Bidder 2 should be the lowest (L1)
    expect(tender.lowestBidder).to.equal(bidder2.address);
  });

  it("Step 6: Fast forward time to end the reveal phase", async function () {
    await time.increase(revealDuration + 1);
  });

  it("Step 7: Admin awards the contract", async function () {
    await secureTender.connect(admin).awardContract(tenderId);

    const tender = await secureTender.tenders(tenderId);
    expect(tender.isOpen).to.equal(false);
  });

  it("Step 8: Loser withdraws EMD, Winner's EMD remains locked", async function () {
    // Bidder 1 (Loser) withdraws their 1 ETH EMD
    await expect(secureTender.connect(bidder1).withdrawEMD(tenderId))
      .to.emit(secureTender, "EMDWithdrawn")
      .withArgs(tenderId, bidder1.address, emdAmount);

    // Bidder 2 (Winner) tries to withdraw, but the contract should block it
    await expect(secureTender.connect(bidder2).withdrawEMD(tenderId))
      .to.be.revertedWith("Cannot withdraw EMD at this time");
  });
});