const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Modular Voting Platform", function () {
  let registry, factory;
  let owner, voter1, voter2, voter3;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("VoterRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();

    const Factory = await ethers.getContractFactory("ElectionFactory");
    factory = await Factory.deploy(await registry.getAddress());
    await factory.waitForDeployment();

    await registry.registerVoter(voter1.address);
    await registry.registerVoter(voter2.address);
    await registry.registerVoter(voter3.address);
  });

  it("Registra votantes", async function () {
    expect(await registry.isRegistered(voter1.address)).to.be.true;
    expect(await registry.getTotalRegistered()).to.equal(3);
  });

  it("Crea elecciones desde la factory", async function () {
    const latest = await ethers.provider.getBlock("latest");
    const start = Number(latest.timestamp) + 100;
    const end = start + 3600;
    const tx = await factory.createElection(
      "Test Election",
      "Test Description",
      ["A", "B", "C"],
      start,
      end,
      0,
      1
    );
    const receipt = await tx.wait();
    const evt = receipt.logs
      .map((l) => factory.interface.parseLog(l))
      .find((e) => e && e.name === "ElectionCreated");
    const election = await ethers.getContractAt("Election", evt.args.electionAddress);
    expect(await factory.electionsCount()).to.equal(1);
    expect(await election.name()).to.equal("Test Election");
  });

  describe("Selección Única (SINGLE_CHOICE)", function () {
    let election;

    beforeEach(async function () {
      const latest = await ethers.provider.getBlock("latest");
      const start = Number(latest.timestamp) + 100;
      const end = start + 3600;
      const tx = await factory.createElection(
        "Single Choice Election",
        "Only one option allowed",
        ["A", "B", "C"],
        start,
        end,
        0,
        1
      );
      const receipt = await tx.wait();
      const evt = receipt.logs
        .map((l) => factory.interface.parseLog(l))
        .find((e) => e && e.name === "ElectionCreated");
      election = await ethers.getContractAt("Election", evt.args.electionAddress);
    });

    it("Permite voteSingle para elección SINGLE_CHOICE", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      const tx = await election.connect(voter1).voteSingle(0);
      const receipt = await tx.wait();
      const evt = receipt.logs
        .map((l) => election.interface.parseLog(l))
        .find((e) => e && e.name === "VoteCast");
      expect(evt).to.not.be.undefined;
      expect(evt.args[0]).to.equal(voter1.address);
      expect(evt.args[1]).to.equal(0);
    });

    it("Rechaza voteMultiple en elección SINGLE_CHOICE", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(voter1).voteMultiple([0, 1])).to.be.revertedWith("Wrong voting type");
    });

    it("Impide voteSingle dos veces", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await election.connect(voter1).voteSingle(0);
      await expect(election.connect(voter1).voteSingle(1)).to.be.revertedWith("Already voted");
    });

    it("Rechaza candidato inválido en voteSingle", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(voter1).voteSingle(5)).to.be.revertedWith("Invalid candidate");
    });

    it("Impide voteSingle fuera de ventana de tiempo", async function () {
      await expect(election.connect(voter1).voteSingle(0)).to.be.revertedWith("Election not started");
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine", []);
      await expect(election.connect(voter1).voteSingle(0)).to.be.revertedWith("Election ended");
    });

    it("Conteo correcto por candidato en voteSingle", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await election.connect(voter1).voteSingle(0);
      await election.connect(voter2).voteSingle(1);
      await election.connect(voter3).voteSingle(0);

      const candidate0 = await election.getCandidate(0);
      const candidate1 = await election.getCandidate(1);
      expect(candidate0[1]).to.equal(2);
      expect(candidate1[1]).to.equal(1);
      expect(await election.totalVotes()).to.equal(3);
    });

    it("Impide al administrador votar en su propia elección (voteSingle)", async function () {
      await registry.registerVoter(owner.address);
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(owner).voteSingle(0)).to.be.revertedWith("Admin cannot vote");
    });
  });

  describe("Selección Múltiple (MULTIPLE_CHOICE)", function () {
    let election;

    beforeEach(async function () {
      const latest = await ethers.provider.getBlock("latest");
      const start = Number(latest.timestamp) + 100;
      const end = start + 3600;
      const tx = await factory.createElection(
        "Multiple Choice Election",
        "Choose up to 2 options",
        ["A", "B", "C", "D"],
        start,
        end,
        1,
        2
      );
      const receipt = await tx.wait();
      const evt = receipt.logs
        .map((l) => factory.interface.parseLog(l))
        .find((e) => e && e.name === "ElectionCreated");
      election = await ethers.getContractAt("Election", evt.args.electionAddress);
    });

    it("Permite voteMultiple para elección MULTIPLE_CHOICE", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      const tx = await election.connect(voter1).voteMultiple([0, 1]);
      const receipt = await tx.wait();
      const evt = receipt.logs
        .map((l) => election.interface.parseLog(l))
        .find((e) => e && e.name === "VoteMultipleCast");
      expect(evt).to.not.be.undefined;
      expect(evt.args[0]).to.equal(voter1.address);
      expect(evt.args[1][0]).to.equal(0);
      expect(evt.args[1][1]).to.equal(1);
    });

    it("Suma un voto a cada candidato seleccionado", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await election.connect(voter1).voteMultiple([0, 2]);
      await election.connect(voter2).voteMultiple([1, 2]);

      const cand0 = await election.getCandidate(0);
      const cand1 = await election.getCandidate(1);
      const cand2 = await election.getCandidate(2);
      expect(cand0[1]).to.equal(1);
      expect(cand1[1]).to.equal(1);
      expect(cand2[1]).to.equal(2);
      expect(await election.totalVotes()).to.equal(4);
    });

    it("Rechaza voteSingle en elección MULTIPLE_CHOICE", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(voter1).voteSingle(0)).to.be.revertedWith("Wrong voting type");
    });

    it("Rechaza más opciones que maxChoices", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(voter1).voteMultiple([0, 1, 2])).to.be.revertedWith("Too many choices");
    });

    it("Rechaza candidatos duplicados en voteMultiple", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(voter1).voteMultiple([0, 0])).to.be.revertedWith("Duplicate candidate");
    });

    it("Rechaza candidato inválido en voteMultiple", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(voter1).voteMultiple([0, 10])).to.be.revertedWith("Invalid candidate");
    });

    it("Impide voteMultiple dos veces", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await election.connect(voter1).voteMultiple([0, 1]);
      await expect(election.connect(voter1).voteMultiple([2, 3])).to.be.revertedWith("Already voted");
    });

    it("Rechaza array vacío en voteMultiple", async function () {
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(voter1).voteMultiple([])).to.be.revertedWith("Must select at least one");
    });

    it("Impide al administrador votar en su propia elección (voteMultiple)", async function () {
      await registry.registerVoter(owner.address);
      await ethers.provider.send("evm_increaseTime", [200]);
      await ethers.provider.send("evm_mine", []);

      await expect(election.connect(owner).voteMultiple([0, 1])).to.be.revertedWith("Admin cannot vote");
    });
  });
});
