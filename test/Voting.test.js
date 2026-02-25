const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Modular Voting Platform", function () {
  let registry, factory, election;
  let owner, voter1, voter2;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("VoterRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();

    const Factory = await ethers.getContractFactory("ElectionFactory");
    factory = await Factory.deploy(await registry.getAddress());
    await factory.waitForDeployment();

    await registry.registerVoter(voter1.address);
    await registry.registerVoter(voter2.address);

    const latest = await ethers.provider.getBlock("latest");
    const start = Number(latest.timestamp) + 100;
    const end = start + 3600;
    const tx = await factory.createElection(
      "Test Election",
      "Test Description",
      ["A", "B", "C"],
      start,
      end
    );
    const receipt = await tx.wait();
    const evt = receipt.logs
      .map((l) => factory.interface.parseLog(l))
      .find((e) => e && e.name === "ElectionCreated");
    election = await ethers.getContractAt("Election", evt.args.electionAddress);
  });

  it("Registra votantes", async function () {
    expect(await registry.isRegistered(voter1.address)).to.be.true;
    expect(await registry.getTotalRegistered()).to.equal(2);
  });

  it("Crea elecciones desde la factory", async function () {
    expect(await factory.electionsCount()).to.equal(1);
    expect(await election.name()).to.equal("Test Election");
  });

  it("Permite votar una sola vez por elección", async function () {
    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);

    await election.connect(voter1).vote(0);
    await expect(election.connect(voter1).vote(1)).to.be.revertedWith("Already voted");
  });

  it("Impide votar fuera de la ventana de tiempo", async function () {
    await expect(election.connect(voter1).vote(0)).to.be.revertedWith("Election not started");
    await ethers.provider.send("evm_increaseTime", [4000]);
    await ethers.provider.send("evm_mine", []);
    await expect(election.connect(voter1).vote(0)).to.be.revertedWith("Election ended");
  });

  it("Conteo por candidato", async function () {
    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);
    await election.connect(voter1).vote(0);
    await election.connect(voter2).vote(1);

    const candidate0 = await election.getCandidate(0);
    const candidate1 = await election.getCandidate(1);
    expect(candidate0[1]).to.equal(1);
    expect(candidate1[1]).to.equal(1);
    expect(await election.totalVotes()).to.equal(2);
  });
});
