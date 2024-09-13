const Cfn = artifacts.require("CFN");
const Egg = artifacts.require("Egg");
const ProtocolEggExecutionManager = artifacts.require(
  "ProtocolEggExecutionManger"
);

module.exports = async function (deployer, network, accounts) {
  const adminWallet = accounts[0];

  const receiveWallet = accounts[1];

  // cfn erc20 deploy
  await deployer.deploy(Cfn, { from: adminWallet });
  const cfnInstance = await Cfn.deployed();

  // egg erc721 nft deploy
  await deployer.deploy(Egg, { from: adminWallet });
  const eggInstance = await Egg.deployed();

  // protocolEggExecutionManager deploy
  await deployer.deploy(
    ProtocolEggExecutionManager,
    receiveWallet,
    eggInstance.address,
    cfnInstance.address,
    { from: adminWallet }
  );
  const protocolEggExecutionInstance =
    await ProtocolEggExecutionManager.deployed();

  // egg operate register protocolEggExecutionManager
  eggInstance.addAddressToWhitelist(protocolEggExecutionInstance.address, {
    from: adminWallet,
  });
};
