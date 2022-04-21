const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const comiledFactory = require("../ethereum/build/CampaginFactory.json");
const compiledCampaingn = require("../ethereum/build/Campagin.json");
const { addAbortSignal } = require("stream");

let accounts;
let factory;
let campaignAddress;
let campagin;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(comiledFactory.interface))
    .deploy({ data: comiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1000000",
  });

  const addresses = await factory.methods.getDeployedCampaign().call();
  campaignAddress = addresses[0];
  campagin = await new web3.eth.Contract(
    JSON.parse(compiledCampaingn.interface),
    campaignAddress
  );
});

describe("campaign", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campagin.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campagin.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it("allows people to contribute mony and marks them as approver", async () => {
    await campagin.methods.contribute().send({
      value: "200",
      from: accounts[1],
    });

    const isContributor = await campagin.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it("reuires a minimum contribution", async () => {
    try {
      await campagin.methods.contribute().send({
        value: "4",
        from: accounts[1],
      });
      assert(false);
    } catch (error) {
      assert(error);
    }
  });

  it("allows a manager to make a payment reuest", async () => {
    await campagin.methods
      .createRequest("Buy batteries", "100", accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    const request = await campagin.methods.requests(0).call();

    assert("Buy batteries", request.description);
  });

  it("process reuests", async () => {
    await campagin.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("10", "ether"),
    });

    await campagin.methods
      .createRequest(
        "Buy batteries",
        web3.utils.toWei("5", "ether"),
        accounts[1]
      )
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    await campagin.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    await campagin.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1000000",
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);
    console.log(balance);

    assert(balance > 104);
  });
});
