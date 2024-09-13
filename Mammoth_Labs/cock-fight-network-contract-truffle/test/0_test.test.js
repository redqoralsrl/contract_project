const Cockfight = artifacts.require("CockFight");
const Cfn = artifacts.require("CFN");
const Egg = artifacts.require("Egg");
const ProtocolEggExecutionManager = artifacts.require(
  "ProtocolEggExecutionManger"
);
const CFNAccessControl = artifacts.require("CFNAccessControl");
const CockerelChick = artifacts.require("CockerelChick");
const PulletChick = artifacts.require("PulletChick");
const Cock = artifacts.require("Cock");
const Hen = artifacts.require("Hen");
const CockItem = artifacts.require("CockItem");
const ChickItem = artifacts.require("ChickItem");
const EggItem = artifacts.require("EggItem");

const {
  expectRevert,
  time,
  BN,
  expectEvent,
} = require("@openzeppelin/test-helpers");

contract("-------------------- 쿡파이트 --------------------", (accounts) => {
  const [deployer, receiveWallet, user, user2, other] = accounts;

  // erc20
  let tokenInstance;

  // egg erc721
  let eggInstance;
  let protocolEggManagerInstance;

  // owner
  let cfnAccessControlInstance;

  // chick, cock erc721
  let cockerelChickInstance;
  let pulletChickInstance;
  let cockInstance;
  let henInstance;

  // erc1155 item
  let eggItemInstance;
  let cockItemInstance;
  let chickItemInstance;

  // main contract
  let cockFightInstance;

  const eggItem1 = {
    tokenId: 1,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 24 * 60 * 60, // 1 day
  };
  const eggItem2 = {
    tokenId: 2,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 2 * 24 * 60 * 60, // 2 day
  };
  const chickItem1 = {
    tokenId: 1,
    isPulletPossible: true,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 24 * 60 * 60, // 1 day
    statsIndex: 0,
  };
  // attack
  const chickItem2 = {
    tokenId: 2,
    isPulletPossible: false,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 0,
    statsIndex: 0,
  };
  // attack speed
  const chickItem3 = {
    tokenId: 3,
    isPulletPossible: false,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 0,
    statsIndex: 1,
  };
  // crit chance
  const chickItem4 = {
    tokenId: 4,
    isPulletPossible: false,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 0,
    statsIndex: 2,
  };
  // health
  const chickItem5 = {
    tokenId: 5,
    isPulletPossible: false,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 0,
    statsIndex: 3,
  };
  // evasion
  const chickItem6 = {
    tokenId: 6,
    isPulletPossible: false,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    day: 0,
    statsIndex: 4,
  };
  const cockItem = {
    tokenId: 1,
    isSale: true,
    price: web3.utils.toWei("1", "ether"),
    healing: true,
  };

  // 배포 세팅
  beforeEach(async () => {
    // 1. deploy cfn token contract
    tokenInstance = await Cfn.new({ from: deployer });

    // 2. deploy egg contract
    eggInstance = await Egg.new({ from: deployer });

    // 3. deploy protocolEggExecution contract
    protocolEggManagerInstance = await ProtocolEggExecutionManager.new(
      receiveWallet,
      eggInstance.address,
      tokenInstance.address,
      { from: deployer }
    );

    // egg operator 등록
    await eggInstance.addAddressToWhitelist(
      protocolEggManagerInstance.address,
      {
        from: deployer,
      }
    );

    // sale 활성화
    await eggInstance.setSaleIsActive(true, { from: deployer });

    // 4. deploy cfnaccesscontrol contract
    cfnAccessControlInstance = await CFNAccessControl.new({ from: deployer });

    // 5. deploy egg item contract
    eggItemInstance = await EggItem.new(cfnAccessControlInstance.address, {
      from: deployer,
    });

    // item 추가
    await eggItemInstance.addItems(eggItem1, { from: deployer });
    await eggItemInstance.addItems(eggItem2, { from: deployer });

    // 6. deploy cocker chick contract
    cockerelChickInstance = await CockerelChick.new(
      cfnAccessControlInstance.address,
      { from: deployer }
    );

    // 7. deploy pullet chick contract
    pulletChickInstance = await PulletChick.new(
      cfnAccessControlInstance.address,
      {
        from: deployer,
      }
    );

    // 8. deploy chick item contract
    chickItemInstance = await ChickItem.new(cfnAccessControlInstance.address, {
      from: deployer,
    });

    // item 추가
    await chickItemInstance.addItems(chickItem1, { from: deployer });
    await chickItemInstance.addItems(chickItem2, { from: deployer });
    await chickItemInstance.addItems(chickItem3, { from: deployer });
    await chickItemInstance.addItems(chickItem4, { from: deployer });
    await chickItemInstance.addItems(chickItem5, { from: deployer });
    await chickItemInstance.addItems(chickItem6, { from: deployer });

    // 9. deploy hen contract
    henInstance = await Hen.new(cfnAccessControlInstance.address, {
      from: deployer,
    });

    // 10. deploy cock contract
    cockInstance = await Cock.new(cfnAccessControlInstance.address, {
      from: deployer,
    });

    // 11. deploy cock item
    cockItemInstance = await CockItem.new(cfnAccessControlInstance.address, {
      from: deployer,
    });

    // item 추가
    await cockItemInstance.addItems(cockItem, { from: deployer });

    // 12. deploy cock fight contract
    cockFightInstance = await Cockfight.new(
      cfnAccessControlInstance.address,
      receiveWallet,
      eggInstance.address,
      tokenInstance.address,
      eggItemInstance.address,
      cockerelChickInstance.address,
      pulletChickInstance.address,
      chickItemInstance.address,
      cockInstance.address,
      henInstance.address,
      cockItemInstance.address
    );

    // egg operator 등록
    await eggInstance.addAddressToWhitelist(cockFightInstance.address, {
      from: deployer,
    });

    // control 등록
    await cfnAccessControlInstance.addWhiteListControl(
      cockFightInstance.address,
      {
        from: deployer,
      }
    );
  });
});
