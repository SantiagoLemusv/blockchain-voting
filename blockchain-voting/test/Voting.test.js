const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blockchain Voting System", function () {
  let registry, voting;
  let owner, voter1, voter2;
  
  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();
    
    // Desplegar Registry
    const Registry = await ethers.getContractFactory("Registry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
    
    // Desplegar Voting
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(await registry.getAddress());
    await voting.waitForDeployment();
    
    // Registrar votantes
    await registry.registerVoter(voter1.address);
    await registry.registerVoter(voter2.address);
  });
  
  describe("Registry", function () {
    it("Should register voters", async function () {
      expect(await registry.isRegistered(voter1.address)).to.be.true;
      expect(await registry.getTotalRegistered()).to.equal(2);
    });
    
    it("Should not allow duplicate registration", async function () {
      await expect(
        registry.registerVoter(voter1.address)
      ).to.be.revertedWith("Already registered");
    });
  });
  
  describe("Voting", function () {
    let electionId;
    
    beforeEach(async function () {
      const startTime = Math.floor(Date.now() / 1000) + 100;
      const options = ["Option A", "Option B", "Option C"];
      
      const tx = await voting.createElection(
        "Test Election",
        "Test Description",
        options,
        startTime,
        3600 // 1 hour
      );
      
      const receipt = await tx.wait();
      electionId = 1;
    });
    
    it("Should create election", async function () {
      const info = await voting.getElectionInfo(electionId);
      expect(info.name).to.equal("Test Election");
    });
    
    it("Should allow voting", async function () {
      // Avanzar el tiempo (simulación)
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);
      
      await voting.connect(voter1).vote(electionId, 0);
      expect(await voting.hasVoted(electionId, voter1.address)).to.be.true;
    });
    
    it("Should not allow double voting", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);
      
      await voting.connect(voter1).vote(electionId, 0);
      
      await expect(
        voting.connect(voter1).vote(electionId, 1)
      ).to.be.revertedWith("Already voted");
    });
  });
});