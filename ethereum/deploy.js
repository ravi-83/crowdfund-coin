const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const comiledFactory = require("./build/CampaginFactory.json");

const provider = new HDWalletProvider(
  "mandate oak wasp session special trial humble stool purse develop viable match",
  "https://rinkeby.infura.io/v3/6532665bad0749a59e52a67bedfd360e"
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log("Attempting to deploy from account", accounts[0]);

  const result = await new web3.eth.Contract(
    JSON.parse(comiledFactory.interface)
  )
    .deploy({ data: comiledFactory.bytecode })
    .send({ gas: "1000000", from: accounts[0] });

  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};
deploy();
