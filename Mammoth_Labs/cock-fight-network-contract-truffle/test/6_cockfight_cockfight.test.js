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
const { assert } = require("chai");

contract(
  "-------------------- !!쿡파이트 정산테스트 중요!! --------------------",
  (accounts) => {
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
      chickItemInstance = await ChickItem.new(
        cfnAccessControlInstance.address,
        {
          from: deployer,
        }
      );

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

    describe("########## ProtocolEggExecutionManager 정산 테스트", () => {
      it("Egg 낱개 판매 정산 수량 맞는지", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        await tokenInstance.transfer(user2, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          web3.utils.toWei("1000", "ether"),
          {
            from: user,
          }
        );

        // mint
        const receipt = await protocolEggManagerInstance.singleMint({
          from: user,
        });

        const tokenId = new BN(1);

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: new BN(1),
        });

        // 정산 확인
        const protocolEggExecutionContractBalance =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 1개 판매 맞는지
        assert.equal(
          protocolEggExecutionContractBalance.toString(),
          eggPrice.toString()
        );

        // 유저 잔액 확인
        const userBalance = await tokenInstance.balanceOf(user);
        // 알 1개 민팅 값 제대로 냈는지?
        assert.equal(
          new BN(web3.utils.toWei("1000", "ether"))
            .sub(new BN(eggPrice.toString()))
            .toString(),
          userBalance.toString()
        );

        // 4번 mint
        await protocolEggManagerInstance.singleMint({
          from: user,
        });
        await protocolEggManagerInstance.singleMint({
          from: user,
        });
        await protocolEggManagerInstance.singleMint({
          from: user,
        });
        await protocolEggManagerInstance.singleMint({
          from: user,
        });

        // 정산 확인 2
        const protocolEggExecutionContractBalance2 =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 5개 판매한 금액 맞는지
        assert.equal(
          protocolEggExecutionContractBalance2.toString(),
          new BN(eggPrice.toString()).mul(new BN(5)).toString()
        );

        // 유저 잔액 확인2
        const userBalance2 = await tokenInstance.balanceOf(user);
        // 알 5개 민팅 값 제대로 냈는지?
        assert.equal(
          new BN(web3.utils.toWei("1000", "ether"))
            .sub(new BN(eggPrice.toString()).mul(new BN(5)))
            .toString(),
          userBalance2.toString()
        );
      });
      it("Egg Batch 판매 정산 수량 맞는지?", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const numberOfTokens = 5;
        const totalCost = eggPrice.mul(new BN(numberOfTokens));

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        await tokenInstance.transfer(user2, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          web3.utils.toWei("1000", "ether"),
          {
            from: user,
          }
        );

        // 민팅
        const receipt = await protocolEggManagerInstance.batchMint(
          numberOfTokens,
          {
            from: user,
          }
        );

        // Check if the correct number of eggs were minted
        for (let i = 1; i <= numberOfTokens; i++) {
          assert.equal(await eggInstance.ownerOf(new BN(i)), user);
        }

        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: totalCost,
          counts: new BN(numberOfTokens),
        });

        // 정산 확인
        const protocolEggExecutionContractBalance =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 batchMint 판매 맞는지
        assert.equal(
          protocolEggExecutionContractBalance.toString(),
          totalCost.toString()
        );

        // 유저 잔액 확인
        const userBalance = await tokenInstance.balanceOf(user);
        // 알 batchMint 민팅 값 제대로 냈는지?
        assert.equal(
          new BN(web3.utils.toWei("1000", "ether"))
            .sub(new BN(totalCost.toString()))
            .toString(),
          userBalance.toString()
        );
      });
      it("Egg 판매해서 받은 토큰 전체 인출시 잘되는지", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        await tokenInstance.transfer(user2, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          web3.utils.toWei("1000", "ether"),
          {
            from: user,
          }
        );

        // mint
        const receipt = await protocolEggManagerInstance.singleMint({
          from: user,
        });

        const tokenId = new BN(1);

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: new BN(1),
        });

        // 정산 확인
        const protocolEggExecutionContractBalance =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 1개 판매 맞는지
        assert.equal(
          protocolEggExecutionContractBalance.toString(),
          eggPrice.toString()
        );

        // 유저 잔액 확인
        const userBalance = await tokenInstance.balanceOf(user);
        // 알 1개 민팅 값 제대로 냈는지?
        assert.equal(
          new BN(web3.utils.toWei("1000", "ether"))
            .sub(new BN(eggPrice.toString()))
            .toString(),
          userBalance.toString()
        );

        // 4번 mint
        await protocolEggManagerInstance.singleMint({
          from: user,
        });
        await protocolEggManagerInstance.singleMint({
          from: user,
        });
        await protocolEggManagerInstance.singleMint({
          from: user,
        });
        await protocolEggManagerInstance.singleMint({
          from: user,
        });

        // 정산 확인 2
        const protocolEggExecutionContractBalance2 =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 5개 판매한 금액 맞는지
        assert.equal(
          protocolEggExecutionContractBalance2.toString(),
          new BN(eggPrice.toString()).mul(new BN(5)).toString()
        );

        // 유저 잔액 확인2
        const userBalance2 = await tokenInstance.balanceOf(user);
        // 알 5개 민팅 값 제대로 냈는지?
        assert.equal(
          new BN(web3.utils.toWei("1000", "ether"))
            .sub(new BN(eggPrice.toString()).mul(new BN(5)))
            .toString(),
          userBalance2.toString()
        );

        // 전체 인출하기
        await protocolEggManagerInstance.withdrawAll({ from: deployer });

        const protocolBal = await tokenInstance.balanceOf(
          protocolEggManagerInstance.address
        );
        const receiveWalletBal = await tokenInstance.balanceOf(receiveWallet);

        // 전체 인출시 잔액 0
        assert.equal(protocolBal.toString(), "0");
        // 5개 민팅 값 인출
        assert.equal(
          receiveWalletBal.toString(),
          new BN(eggPrice.toString()).mul(new BN(5)).toString()
        );
      });
      it("Egg 판매해서 받은 토큰 부분 인출시 잘되는지", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const numberOfTokens = 5;
        const totalCost = eggPrice.mul(new BN(numberOfTokens));

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        await tokenInstance.transfer(user2, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });
        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          web3.utils.toWei("1000", "ether"),
          {
            from: user,
          }
        );

        // 민팅
        const receipt = await protocolEggManagerInstance.batchMint(
          numberOfTokens,
          {
            from: user,
          }
        );

        // Check if the correct number of eggs were minted
        for (let i = 1; i <= numberOfTokens; i++) {
          assert.equal(await eggInstance.ownerOf(new BN(i)), user);
        }

        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: totalCost,
          counts: new BN(numberOfTokens),
        });

        // 정산 확인
        const protocolEggExecutionContractBalance =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 batchMint 판매 맞는지
        assert.equal(
          protocolEggExecutionContractBalance.toString(),
          totalCost.toString()
        );

        // 유저 잔액 확인
        const userBalance = await tokenInstance.balanceOf(user);
        // 알 batchMint 민팅 값 제대로 냈는지?
        assert.equal(
          new BN(web3.utils.toWei("1000", "ether"))
            .sub(new BN(totalCost.toString()))
            .toString(),
          userBalance.toString()
        );

        // 토큰 부분 출금
        await protocolEggManagerInstance.withdraw(
          web3.utils.toWei("10", "ether")
        );

        // 출금 확인
        const protocolEggExecutionContractBalance2 =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 batchMint 판매 맞는지
        assert.equal(
          protocolEggExecutionContractBalance2.toString(),
          new BN(totalCost.toString())
            .sub(new BN(web3.utils.toWei("10", "ether").toString()))
            .toString()
        );

        const receiveWalletBal = await tokenInstance.balanceOf(receiveWallet);
        assert.equal(
          receiveWalletBal.toString(),
          web3.utils.toWei("10", "ether").toString()
        );

        // 토큰 부분 출금 한번더
        await protocolEggManagerInstance.withdraw(
          web3.utils.toWei("10", "ether")
        );

        // 출금 확인
        const protocolEggExecutionContractBalance3 =
          await tokenInstance.balanceOf(protocolEggManagerInstance.address);
        // 알 batchMint 판매 맞는지
        assert.equal(
          protocolEggExecutionContractBalance3.toString(),
          new BN(totalCost.toString())
            .sub(new BN(web3.utils.toWei("20", "ether").toString()))
            .toString()
        );

        const receiveWalletBal2 = await tokenInstance.balanceOf(receiveWallet);
        assert.equal(
          receiveWalletBal2.toString(),
          web3.utils.toWei("20", "ether").toString()
        );
      });
    });

    describe("########## 아이템 정산 테스트 ##########", () => {
      it("알 아이템 정산 맞는지 테스트", async () => {
        const amount = 1;
        const itemInfo = await eggItemInstance.tokenURIs(1);
        // 알 아이템 가격
        const eggItemPrice = new BN(itemInfo.price);
        const totalCost = eggItemPrice
          .mul(new BN(amount.toString()))
          .toString();

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });

        // 토큰 approve
        await tokenInstance.approve(
          cockFightInstance.address,
          web3.utils.toWei("1000", "ether"),
          {
            from: user,
          }
        );

        const itemTokenId = 1;
        // 알 아이템 구매
        const receipt2 = await cockFightInstance.eggItemBuy(
          new BN(itemTokenId),
          new BN(amount),
          {
            from: user,
          }
        );

        // egg item 보유량
        const balance = (
          await eggItemInstance.balanceOf(user, itemTokenId)
        ).toString();

        assert.equal(balance, amount.toString());

        expectEvent(receipt2, "EggItemBuy", {
          eggItemContract: eggItemInstance.address,
          owner: user,
          tokenId: itemTokenId.toString(),
          amount: amount.toString(),
          price: totalCost,
        });

        const cockFightAddressBalance = await tokenInstance.balanceOf(
          cockFightInstance.address
        );

        assert.equal(cockFightAddressBalance.toString(), totalCost.toString());

        const userBalance = await tokenInstance.balanceOf(user);

        assert.equal(
          userBalance.toString(),
          new BN(web3.utils.toWei("1000", "ether"))
            .sub(new BN(totalCost))
            .toString()
        );
      });
      it("병아리 아이템 정산 맞는지 테스트", async () => {
        const itemTokenId = 1;
        const amount = 1;
        const itemInfo = await chickItemInstance.tokenURIs(1);
        // 알 아이템 가격
        const chickItemPrice = new BN(itemInfo.price);
        const totalCost = chickItemPrice
          .mul(new BN(amount.toString()))
          .toString();

        const itemTokenId2 = 2;
        const amount2 = 2;
        const itemInfo2 = await chickItemInstance.tokenURIs(2);
        // 알 아이템 가격
        const chickItemPrice2 = new BN(itemInfo2.price);
        const totalCost2 = chickItemPrice2
          .mul(new BN(amount2.toString()))
          .toString();

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });

        // 토큰 approve
        await tokenInstance.approve(
          cockFightInstance.address,
          web3.utils.toWei("1000", "ether"),
          {
            from: user,
          }
        );

        // 아이템 1 사기
        await cockFightInstance.chickItemBuy(itemTokenId, amount, {
          from: user,
        });

        // chick item 보유량
        const userItemBalance = (
          await chickItemInstance.balanceOf(user, itemTokenId)
        ).toString();

        // chick 아이템 개수 맞는지?
        assert.equal(userItemBalance.toString(), amount.toString());

        const userBalance = await tokenInstance.balanceOf(user);

        // 유저 아이템 산 가격 뺀 금액 확인
        assert.equal(
          userBalance.toString(),
          new BN(web3.utils.toWei("1000", "ether").toString())
            .sub(new BN(totalCost.toString()))
            .toString()
        );

        // 정산 확인
        const cockFightBalance = await tokenInstance.balanceOf(
          cockFightInstance.address
        );

        assert.equal(cockFightBalance.toString(), totalCost.toString());

        // 아이템 2 사기
        await cockFightInstance.chickItemBuy(itemTokenId2, amount2, {
          from: user,
        });

        // chick item2 보유량
        const userItemBalance2 = (
          await chickItemInstance.balanceOf(user, itemTokenId2)
        ).toString();

        assert.equal(userItemBalance2.toString(), amount2.toString());

        const userBalance2 = await tokenInstance.balanceOf(user);

        // 유저 아이템 산 가격 뺀 금액 확인
        assert.equal(
          userBalance2.toString(),
          new BN(web3.utils.toWei("1000", "ether").toString())
            .sub(new BN(totalCost.toString()))
            .sub(new BN(totalCost2.toString()))
            .toString()
        );

        // 정산 확인
        const cockFightBalance2 = await tokenInstance.balanceOf(
          cockFightInstance.address
        );

        assert.equal(
          cockFightBalance2.toString(),
          new BN(totalCost.toString())
            .add(new BN(totalCost2.toString()))
            .toString()
        );
      });
      it("닭 아이템 정산 맞는지 테스트", async () => {
        const itemTokenId = 1;
        const amount = 1;

        const itemInfo = await cockItemInstance.tokenURIs(1);
        const cockItemPrice = new BN(itemInfo.price);
        const totalCost = cockItemPrice
          .mul(new BN(amount.toString()))
          .toString();

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
          from: deployer,
        });

        // 토큰 approve
        await tokenInstance.approve(
          cockFightInstance.address,
          web3.utils.toWei("1000", "ether"),
          {
            from: user,
          }
        );

        // 아이템 1 사기
        await cockFightInstance.cockItemBuy(itemTokenId, amount, {
          from: user,
        });

        // cock item 보유량
        const userItemBalance = (
          await cockItemInstance.balanceOf(user, itemTokenId)
        ).toString();

        // cock 아이템 개수 맞는지?
        assert.equal(userItemBalance.toString(), amount.toString());

        const userBalance = await tokenInstance.balanceOf(user);

        // 유저 아이템 산 가격 뺀 금액 확인
        assert.equal(
          userBalance.toString(),
          new BN(web3.utils.toWei("1000", "ether").toString())
            .sub(new BN(totalCost.toString()))
            .toString()
        );

        // 정산 확인
        const cockFightBalance = await tokenInstance.balanceOf(
          cockFightInstance.address
        );

        assert.equal(cockFightBalance.toString(), totalCost.toString());
      });
    });

    describe("########## 정산 테스트 ##########", () => {
      const buyEggItem = async (userAddress, tokenId, amounts) => {
        const amount = amounts;
        const itemInfo = await eggItemInstance.tokenURIs(tokenId);
        // 알 아이템 가격
        const eggItemPrice = new BN(itemInfo.price);
        const totalCost = eggItemPrice
          .mul(new BN(amount.toString()))
          .toString();

        // 토큰 전송
        await tokenInstance.transfer(userAddress, totalCost, {
          from: deployer,
        });

        // 토큰 approve
        await tokenInstance.approve(cockFightInstance.address, totalCost, {
          from: userAddress,
        });

        const itemTokenId = tokenId;
        // 알 아이템 구매
        await cockFightInstance.eggItemBuy(
          new BN(itemTokenId),
          new BN(amount),
          {
            from: userAddress,
          }
        );

        return [itemTokenId, amount, totalCost];
      };
      const buyChickItem = async (userAddress, tokenId, amounts) => {
        const itemTokenId = tokenId;
        const amount = amounts;
        const itemInfo = await chickItemInstance.tokenURIs(itemTokenId);
        // 알 아이템 가격
        const chickItemPrice = new BN(itemInfo.price);
        const totalCost = chickItemPrice
          .mul(new BN(amount.toString()))
          .toString();

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, totalCost, {
          from: deployer,
        });

        // 토큰 approve
        await tokenInstance.approve(cockFightInstance.address, totalCost, {
          from: userAddress,
        });

        // 아이템 사기
        await cockFightInstance.chickItemBuy(itemTokenId, amount, {
          from: userAddress,
        });

        return [itemTokenId, amount, totalCost];
      };
      it("토큰 전체 인출시 잘되는지", async () => {
        {
          // 1회 출금 테스트
          const [_tokenId, _amount, _totalCost] = await buyEggItem(user, 1, 2);
          const [_chick_tokenId, _chick_amount, _chick_totalCost] =
            await buyChickItem(user, 1, 3);

          {
            // 정산 확인
            const cockFightBalance = await tokenInstance.balanceOf(
              cockFightInstance.address
            );

            assert.equal(
              cockFightBalance.toString(),
              new BN(_totalCost).add(new BN(_chick_totalCost)).toString()
            );
          }

          // 출금 작동
          await cockFightInstance.withdrawTokenAll({ from: deployer });

          {
            // 정산 확인
            const cockFightBalance = await tokenInstance.balanceOf(
              cockFightInstance.address
            );

            assert.equal(cockFightBalance.toString(), "0");
          }
        }
        {
          // 2회 출금 테스트 이어서
          const [_tokenId, _amount, _totalCost] = await buyEggItem(user, 1, 2);
          const [_chick_tokenId, _chick_amount, _chick_totalCost] =
            await buyChickItem(user, 1, 3);

          {
            // 정산 확인
            const cockFightBalance = await tokenInstance.balanceOf(
              cockFightInstance.address
            );

            assert.equal(
              cockFightBalance.toString(),
              new BN(_totalCost).add(new BN(_chick_totalCost)).toString()
            );
          }

          // 출금 작동
          await cockFightInstance.withdrawTokenAll({ from: deployer });

          {
            // 정산 확인
            const cockFightBalance = await tokenInstance.balanceOf(
              cockFightInstance.address
            );

            assert.equal(cockFightBalance.toString(), "0");
          }
        }
      });
      it("토큰 부분 인출시 잘되는지", async () => {
        {
          // 1회 출금 테스트
          const [_tokenId, _amount, _totalCost] = await buyEggItem(user, 1, 2);
          const [_chick_tokenId, _chick_amount, _chick_totalCost] =
            await buyChickItem(user, 1, 3);

          {
            // 정산 확인
            const cockFightBalance = await tokenInstance.balanceOf(
              cockFightInstance.address
            );

            assert.equal(
              cockFightBalance.toString(),
              new BN(_totalCost).add(new BN(_chick_totalCost)).toString()
            );
          }

          // 출금 작동
          await cockFightInstance.withdrawToken("100", { from: deployer });

          {
            // 정산 확인
            const cockFightBalance = await tokenInstance.balanceOf(
              cockFightInstance.address
            );

            assert.equal(
              cockFightBalance.toString(),
              new BN(_totalCost)
                .add(new BN(_chick_totalCost))
                .sub(new BN("100"))
                .toString()
            );
          }

          // 출금 작동
          await cockFightInstance.withdrawToken("100", { from: deployer });
          {
            // 정산 확인
            const cockFightBalance = await tokenInstance.balanceOf(
              cockFightInstance.address
            );

            assert.equal(
              cockFightBalance.toString(),
              new BN(_totalCost)
                .add(new BN(_chick_totalCost))
                .sub(new BN("100"))
                .sub(new BN("100"))
                .toString()
            );
          }
        }
      });
    });
  }
);
