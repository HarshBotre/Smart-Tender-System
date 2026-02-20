const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SecureTenderModule", (m) => {
  // This tells Hardhat to grab the "SecureTender" contract we wrote
  const secureTender = m.contract("SecureTender");

  return { secureTender };
});