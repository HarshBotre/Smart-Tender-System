// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SecureTender
 * @dev Implements a Commit-Reveal scheme for a Two-Bid Tender Management System.
 * Admin (Owner) manages the tender lifecycle, while bidders lock EMD and hide financial bids using hashes.
 */
contract SecureTender is Ownable, ReentrancyGuard {
    
    // --- STRUCTURES ---

    struct Tender {
        uint256 id;
        string metadataURI;        // IPFS link to NIT/BoQ
        uint256 emdAmount;         // Earnest Money Deposit required
        uint256 biddingEndTimestamp; 
        uint256 revealEndTimestamp;  
        bool isOpen;               // True until the contract is awarded
        address lowestBidder;      // L1 Bidder
        uint256 lowestBidAmount;   // L1 Bid Amount
    }

    struct Bid {
        string technicalDocURI;    // IPFS link to technical qualifications
        bytes32 commitment;        // Hashed financial bid: keccak256(amount + secretSalt)
        bool isTechnicallyValid;   // Whitelisted by Admin
        bool hasRevealed;          // True if financial bid is successfully revealed
        bool hasWithdrawnEMD;      // Prevents double EMD withdrawal
    }

    // --- STATE VARIABLES ---

    uint256 public tenderCount;
    
    mapping(uint256 => Tender) public tenders;
    // tenderId => (bidderAddress => Bid)
    mapping(uint256 => mapping(address => Bid)) public bids;

    // --- EVENTS ---

    event TenderCreated(uint256 indexed tenderId, string metadataURI, uint256 emdAmount, uint256 biddingEnd, uint256 revealEnd);
    event BidCommitted(uint256 indexed tenderId, address indexed bidder, string technicalDocURI);
    event TechnicalEvaluated(uint256 indexed tenderId, address[] approvedBidders);
    event BidRevealed(uint256 indexed tenderId, address indexed bidder, uint256 amount);
    event ContractAwarded(uint256 indexed tenderId, address indexed winner, uint256 winningAmount);
    event EMDWithdrawn(uint256 indexed tenderId, address indexed bidder, uint256 amount);

    // --- MODIFIERS ---

    modifier onlyDuringBidding(uint256 _tenderId) {
        require(block.timestamp <= tenders[_tenderId].biddingEndTimestamp, "Bidding phase has ended");
        _;
    }

    modifier onlyDuringReveal(uint256 _tenderId) {
        require(block.timestamp > tenders[_tenderId].biddingEndTimestamp, "Bidding phase is still active");
        require(block.timestamp <= tenders[_tenderId].revealEndTimestamp, "Reveal phase has ended");
        _;
    }

    modifier onlyAfterReveal(uint256 _tenderId) {
        require(block.timestamp > tenders[_tenderId].revealEndTimestamp, "Reveal phase is still active");
        _;
    }

    // Initialize Ownable with the deployer address (OpenZeppelin v5 syntax)
    constructor() Ownable(msg.sender) {}

    // --- FUNCTIONS ---

    /**
     * @dev Admin creates a new tender with specific timelines and EMD.
     */
    function createTender(
        string memory _metadataURI,
        uint256 _emdAmount,
        uint256 _biddingDuration,
        uint256 _revealDuration
    ) external onlyOwner {
        tenderCount++;
        
        uint256 biddingEnd = block.timestamp + _biddingDuration;
        uint256 revealEnd = biddingEnd + _revealDuration;

        tenders[tenderCount] = Tender({
            id: tenderCount,
            metadataURI: _metadataURI,
            emdAmount: _emdAmount,
            biddingEndTimestamp: biddingEnd,
            revealEndTimestamp: revealEnd,
            isOpen: true,
            lowestBidder: address(0),
            lowestBidAmount: type(uint256).max // Initialize with max value so first valid bid becomes L1
        });

        emit TenderCreated(tenderCount, _metadataURI, _emdAmount, biddingEnd, revealEnd);
    }

    /**
     * @dev Bidders submit their technical docs and hashed financial bid. Must attach exact EMD.
     */
    function submitCommitment(
        uint256 _tenderId, 
        string memory _techURI, 
        bytes32 _commitment
    ) external payable onlyDuringBidding(_tenderId) {
        require(msg.value == tenders[_tenderId].emdAmount, "Incorrect EMD amount provided");
        require(bids[_tenderId][msg.sender].commitment == bytes32(0), "Bid already submitted");

        bids[_tenderId][msg.sender] = Bid({
            technicalDocURI: _techURI,
            commitment: _commitment,
            isTechnicallyValid: false, // Default to false until Admin evaluates
            hasRevealed: false,
            hasWithdrawnEMD: false
        });

        emit BidCommitted(_tenderId, msg.sender, _techURI);
    }

    /**
     * @dev Admin evaluates technical bids off-chain and whitelists valid bidders.
     * Can only be done after bidding ends to ensure fairness.
     */
    function evaluateTechnical(
        uint256 _tenderId, 
        address[] calldata _approvedBidders
    ) external onlyOwner onlyDuringReveal(_tenderId) {
        require(tenders[_tenderId].isOpen, "Tender is already awarded");

        for (uint i = 0; i < _approvedBidders.length; i++) {
            address bidder = _approvedBidders[i];
            // Only approve if they actually submitted a bid
            if (bids[_tenderId][bidder].commitment != bytes32(0)) {
                bids[_tenderId][bidder].isTechnicallyValid = true;
            }
        }

        emit TechnicalEvaluated(_tenderId, _approvedBidders);
    }

    /**
     * @dev Technically valid bidders reveal their actual financial bid.
     */
    function revealBid(
        uint256 _tenderId, 
        uint256 _bidAmount, 
        string memory _secretSalt
    ) external onlyDuringReveal(_tenderId) {
        Bid storage userBid = bids[_tenderId][msg.sender];
        
        require(userBid.isTechnicallyValid, "Bidder not technically qualified");
        require(!userBid.hasRevealed, "Bid already revealed");

        // 1. Verify the Hash
        bytes32 generatedHash = keccak256(abi.encodePacked(_bidAmount, _secretSalt));
        require(generatedHash == userBid.commitment, "Invalid bid amount or secret salt");

        // 2. Mark as revealed
        userBid.hasRevealed = true;

        // 3. Dynamically update the Lowest Bidder (L1)
        if (_bidAmount < tenders[_tenderId].lowestBidAmount) {
            tenders[_tenderId].lowestBidAmount = _bidAmount;
            tenders[_tenderId].lowestBidder = msg.sender;
        }

        emit BidRevealed(_tenderId, msg.sender, _bidAmount);
    }

    /**
     * @dev Admin officially awards the contract to the L1 bidder after the reveal phase ends.
     */
    function awardContract(uint256 _tenderId) external onlyOwner onlyAfterReveal(_tenderId) {
        require(tenders[_tenderId].isOpen, "Contract already awarded");
        require(tenders[_tenderId].lowestBidder != address(0), "No valid bids revealed");

        tenders[_tenderId].isOpen = false;

        emit ContractAwarded(_tenderId, tenders[_tenderId].lowestBidder, tenders[_tenderId].lowestBidAmount);
    }

    /**
     * @dev Unsuccessful or disqualified bidders can withdraw their EMD.
     * Protected against Reentrancy. L1's EMD remains locked as Performance Security.
     */
    function withdrawEMD(uint256 _tenderId) external nonReentrant {
        Bid storage userBid = bids[_tenderId][msg.sender];
        Tender storage tender = tenders[_tenderId];

        require(userBid.commitment != bytes32(0), "No bid found");
        require(!userBid.hasWithdrawnEMD, "EMD already withdrawn");
        
        // Conditions for withdrawal:
        // 1. Tender is officially closed and you are NOT the winner.
        // 2. OR you were technically disqualified (can withdraw even before tender closes, but after bidding ends).
        bool isDisqualified = (block.timestamp > tender.biddingEndTimestamp) && (!userBid.isTechnicallyValid);
        bool isLoser = (!tender.isOpen) && (msg.sender != tender.lowestBidder);

        require(isDisqualified || isLoser, "Cannot withdraw EMD at this time");

        userBid.hasWithdrawnEMD = true;

        // Transfer EMD back to the bidder
        (bool success, ) = payable(msg.sender).call{value: tender.emdAmount}("");
        require(success, "EMD transfer failed");

        emit EMDWithdrawn(_tenderId, msg.sender, tender.emdAmount);
    }
}