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

contract(
  "-------------------- 2_cockfight.test.js 쿡파이트 알 구매 / 아이템 사용 / 알 부화 케이스 --------------------",
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

    // 알 구입 함수
    const buyEgg = async (userAddress, i) => {
      // 알 가격
      const eggPrice = await protocolEggManagerInstance.getEggPrice();

      await tokenInstance.transfer(userAddress, eggPrice, { from: deployer });
      await tokenInstance.approve(
        protocolEggManagerInstance.address,
        eggPrice,
        {
          from: userAddress,
        }
      );

      // 알 민팅
      const receipt = await protocolEggManagerInstance.singleMint({
        from: userAddress,
      });

      return [receipt, i.toString()];
    };

    const checkDate = async (i) => {
      const eggInfo = await cockFightInstance.getEggHatchCalculate(i);

      const timestampRemaining = eggInfo.timestampRemaining.toNumber();

      // 남은 시간 계산
      const days = Math.floor(timestampRemaining / (24 * 60 * 60));
      const hours = Math.floor(
        (timestampRemaining % (24 * 60 * 60)) / (60 * 60)
      );
      const minutes = Math.floor((timestampRemaining % (60 * 60)) / 60);
      const seconds = timestampRemaining % 60;

      console.log(
        `       남은 시간: ${days}일 ${hours}시간 ${minutes}분 ${seconds}초`
      );
    };

    describe("######### 쿡파이트 알 테스트 #########", () => {
      it("알 1개 single 민팅 테스트", async () => {
        const i = 1;

        const [receipt, tokenId] = await buyEgg(user, i);

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice.toString(),
          counts: i.toString(),
        });
      });
      it("알 20개 batch 민팅 테스트", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const numberOfTokens = 20;

        const totalCost = eggPrice.mul(new BN(numberOfTokens));

        // 1000개씩 토큰 전송
        await tokenInstance.transfer(user, totalCost, {
          from: deployer,
        });
        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          totalCost,
          {
            from: user,
          }
        );

        // 알 민팅
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
      });
      it("알 민팅 후 아이템 사용", async () => {
        const i = 1;

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const [receipt, tokenId] = await buyEgg(user, i);

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        const itemInfo = await eggItemInstance.tokenURIs(1);
        const eggItemPrice = new BN(itemInfo.price);
        const totalCost = eggItemPrice.mul(new BN(1));

        // 토큰 받기
        await tokenInstance.transfer(user, totalCost, {
          from: deployer,
        });
        // 토큰 approve
        await tokenInstance.approve(cockFightInstance.address, totalCost, {
          from: user,
        });

        // egg item 사기
        const receipt2 = await cockFightInstance.eggItemBuy(
          new BN(1),
          new BN(1),
          {
            from: user,
          }
        );

        const cockFightBalance = (
          await tokenInstance.balanceOf(cockFightInstance.address)
        ).toString();

        assert.equal(cockFightBalance, totalCost.toString());

        const eggItemTokenId = new BN(1);

        // egg item 보유량
        const balance = (
          await eggItemInstance.balanceOf(user, eggItemTokenId)
        ).toString();

        assert.equal(balance, new BN(1).toString());

        expectEvent(receipt2, "EggItemBuy", {
          eggItemContract: eggItemInstance.address,
          owner: user,
          tokenId: eggItemTokenId,
          amount: new BN(1),
          price: totalCost,
        });

        // -------- 알 아이템 사용 -----------

        // 알 부화 기본 세팅 시간
        const eggHatchingTime = await eggInstance.EggHatchingTime();
        // 알 부화 남은 시간
        const beforeTime =
          await cockFightInstance.getEggHatchCalculate(tokenId);

        // 알 아이템 정보 가져오기
        const day = await eggItemInstance.tokenURIs(eggItemTokenId);

        // 1155 approve
        await eggItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        const eggConsumeInput = {
          eggContract: eggInstance.address,
          eggTokenId: 1,
          eggItemContract: eggItemInstance.address,
          eggItemTokenId: 1,
          eggItemAmount: 1,
        };

        await cockFightInstance.eggConsumeItem(eggConsumeInput, { from: user });

        // egg item 사용 후 잔액 0 확인하기
        const afterBalance = (
          await eggItemInstance.balanceOf(user, eggItemTokenId)
        ).toString();

        assert.equal(afterBalance, new BN(0).toString());

        // 알 부화 남은 시간
        const afterTime = await cockFightInstance.getEggHatchCalculate(tokenId);

        console.log("       알 아이템 사용 시 감소할 시간 : " + day.day);
        console.log("       알 기본 시간 : " + eggHatchingTime);
        console.log(
          "       현재 남은 알 시간 : " +
            beforeTime.timestampRemaining.toString()
        );
        console.log(
          "       예상 사용 후 남을 시간 : " +
            new BN(beforeTime.timestampRemaining.toString()).sub(
              new BN(day.day)
            )
        );
        console.log(
          "       아이템 사용 후 남은 시간 : " +
            afterTime.timestampRemaining.toString()
        );
      });
      it("알 민팅 후 부화까지 21개 아이템 사용 후 부화시키기", async () => {
        const i = 1;

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const [receipt, tokenId] = await buyEgg(user, i);

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: new BN(1),
        });

        const itemInfo = await eggItemInstance.tokenURIs(1);
        const eggItemPrice = new BN(itemInfo.price);
        const totalCost = eggItemPrice.mul(new BN(21));

        // 토큰 받기
        await tokenInstance.transfer(user, totalCost, {
          from: deployer,
        });
        // 토큰 approve
        await tokenInstance.approve(cockFightInstance.address, totalCost, {
          from: user,
        });

        // egg item 사기
        const receipt2 = await cockFightInstance.eggItemBuy(
          new BN(1),
          new BN(21),
          {
            from: user,
          }
        );

        const eggItemTokenId = new BN(1);

        // egg item 보유량
        const balance = (
          await eggItemInstance.balanceOf(user, eggItemTokenId)
        ).toString();

        assert.equal(balance, new BN(21).toString());

        expectEvent(receipt2, "EggItemBuy", {
          eggItemContract: eggItemInstance.address,
          owner: user,
          tokenId: eggItemTokenId,
          amount: new BN(21),
          price: totalCost,
        });

        // -------- 알 아이템 사용 -----------

        // 1155 approve
        await eggItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        const eggConsumeInput = {
          eggContract: eggInstance.address,
          eggTokenId: 1,
          eggItemContract: eggItemInstance.address,
          eggItemTokenId: 1,
          eggItemAmount: 21,
        };

        await cockFightInstance.eggConsumeItem(eggConsumeInput, { from: user });

        // egg item 사용 후 잔액 0 확인하기
        const afterBalance = (
          await eggItemInstance.balanceOf(user, eggItemTokenId)
        ).toString();

        assert.equal(afterBalance, new BN(0).toString());

        // 721 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        const eggHatchingInfos =
          await cockFightInstance.getEggHatchCalculate(tokenId);

        assert.equal(eggHatchingInfos.timestampRemaining.toString(), "0");

        const hatchReceipt = await cockFightInstance.eggHatch(
          eggInstance.address,
          tokenId,
          { from: user }
        );

        // egg 721 burn 확인
        assert.equal(
          await eggInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        // 이벤트 확인
        expectEvent(hatchReceipt, "EggHatchResult", {
          owner: user,
          eggContract: eggInstance.address,
          tokenId: new BN(1),
        });

        // 부화된 병아리가 암병아리인지 수병아리인지 확인
        const event = hatchReceipt.logs.find(
          (log) => log.event === "EggHatchResult"
        );
        const chickContractAddress = event.args.chickContract;

        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       부화된 병아리는 암병아리입니다.");
        } else if (chickContractAddress === cockerelChickInstance.address) {
          console.log("       부화된 병아리는 수병아리입니다.");
        }
      });
      it("알 민팅 후 부화 후 burn 잘되고 병아리 잘 부화했는지?", async () => {
        const i = 1;

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const [receipt, tokenId] = await buyEgg(user, i);

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        // 시간 경과
        await time.increase(time.duration.days(22));

        // 721 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        const hatchReceipt = await cockFightInstance.eggHatch(
          eggInstance.address,
          tokenId,
          { from: user }
        );

        // egg 721 burn 확인
        assert.equal(
          await eggInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        // 이벤트 확인
        expectEvent(hatchReceipt, "EggHatchResult", {
          owner: user,
          eggContract: eggInstance.address,
          tokenId: tokenId,
        });

        // 부화된 병아리가 암병아리인지 수병아리인지 확인
        const event = hatchReceipt.logs.find(
          (log) => log.event === "EggHatchResult"
        );
        const chickContractAddress = event.args.chickContract;

        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       부화된 병아리는 암병아리입니다.");
          assert.equal(await pulletChickInstance.ownerOf(tokenId), user);
        } else if (chickContractAddress === cockerelChickInstance.address) {
          console.log("       부화된 병아리는 수병아리입니다.");
          assert.equal(await cockerelChickInstance.ownerOf(tokenId), user);
        }
      });
      it("알 100일 지나도 병아리 잘 부화하는지?", async () => {
        const i = 1;

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const [receipt, tokenId] = await buyEgg(user, i);

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        // 시간 경과
        await time.increase(time.duration.days(100));

        // 721 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        const hatchReceipt = await cockFightInstance.eggHatch(
          eggInstance.address,
          tokenId,
          { from: user }
        );

        // egg 721 burn 확인
        assert.equal(
          await eggInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        // 이벤트 확인
        expectEvent(hatchReceipt, "EggHatchResult", {
          owner: user,
          eggContract: eggInstance.address,
          tokenId: tokenId,
        });

        // 부화된 병아리가 암병아리인지 수병아리인지 확인
        const event = hatchReceipt.logs.find(
          (log) => log.event === "EggHatchResult"
        );
        const chickContractAddress = event.args.chickContract;

        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       부화된 병아리는 암병아리입니다.");
          assert.equal(await pulletChickInstance.ownerOf(tokenId), user);
        } else if (chickContractAddress === cockerelChickInstance.address) {
          console.log("       부화된 병아리는 수병아리입니다.");
          assert.equal(await cockerelChickInstance.ownerOf(tokenId), user);
        }
      });
    });

    describe("######### 쿡파이트 알 에러 케이스 #########", () => {
      it("알 민팅 해서 바로 부화시키는 (apporve X / approve O) 에러케이스", async () => {
        const i = 1;

        const [receipt, tokenId] = await buyEgg(user, i);

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        // 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // burn 안된거 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 알 721을 cockfight 에 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        // 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // burn 안된거 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 시간 지나서 burn 확인
        await time.increase(time.duration.days(22));

        // 알 721을 cockfight 에 approve 안되있을 경우 테스트
        await eggInstance.setApprovalForAll(cockFightInstance.address, false, {
          from: user,
        });

        // 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // burn 안된거 확인
        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 알 721을 cockfight 에 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        // 알 부화
        await cockFightInstance.eggHatch(eggInstance.address, i, {
          from: user,
        });

        // burn 된 거 확인
        assert.equal(
          await eggInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        // 알 부화 했는데 시도 또 시도시
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );
        // 없는 알 부화 시도
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );
      });
      it("알 민팅 후 1일 지나서 부화시 에러케이스 / 알 20일 지나고 1일 남았을 경우 부화시 에러케이스", async () => {
        const i = 1;

        const [receipt, tokenId] = await buyEgg(user, i);

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        // approve 없이 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // 알 721을 cockfight 에 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        // approve 하고 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // 알 721을 cockfight 에 approve 취소
        await eggInstance.setApprovalForAll(cockFightInstance.address, false, {
          from: user,
        });

        // 시간 지나서 burn 확인
        await time.increase(time.duration.days(1));

        // approve 없이 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // 알 721을 cockfight 에 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        // approve 하고 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // 알 721을 cockfight 에 approve 취소
        await eggInstance.setApprovalForAll(cockFightInstance.address, false, {
          from: user,
        });

        // 시간 지나서 burn 확인
        await time.increase(time.duration.days(20));

        // approve 없이 알 부화
        await expectRevert(
          cockFightInstance.eggHatch(eggInstance.address, i, {
            from: user,
          }),
          "revert"
        );

        // 알 721을 cockfight 에 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        // approve 하고 알 부화
        await cockFightInstance.eggHatch(eggInstance.address, i, {
          from: user,
        });

        // burn 확인
        assert.equal(
          await eggInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );
      });
      it("알 부화 시간 끝났는데 알 아이템 사용 시도시 에러케이스", async () => {
        const i = 1;

        const [receipt, tokenId] = await buyEgg(user, i);

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        // 알 가격 잘 받았는지?
        const protocolBalance = (
          await tokenInstance.balanceOf(protocolEggManagerInstance.address)
        ).toString();

        assert.equal(protocolBalance, eggPrice.toString());

        // 날짜 확인
        {
          await checkDate(i);
        }

        // 21일 경과
        await time.increase(time.duration.days(21));

        // 날짜 확인
        {
          await checkDate(i);
        }

        // 토큰 받기
        await tokenInstance.transfer(
          user,
          web3.utils.toWei("1000000", "ether"),
          {
            from: deployer,
          }
        );
        // 토큰 approve
        await tokenInstance.approve(
          cockFightInstance.address,
          web3.utils.toWei("1000000", "ether"),
          {
            from: user,
          }
        );

        const itemInfo = await eggItemInstance.tokenURIs(1);
        const eggItemPrice = new BN(itemInfo.price);
        const totalCost = eggItemPrice.mul(new BN(1));

        // egg item 사기
        const receipt2 = await cockFightInstance.eggItemBuy(
          new BN(1),
          new BN(1),
          {
            from: user,
          }
        );

        // egg item 보유량
        const balance = (
          await eggItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(1).toString());

        // 알 아이템 가격 잘 받았는지?
        const cockfightBalance = (
          await tokenInstance.balanceOf(cockFightInstance.address)
        ).toString();

        assert.equal(cockfightBalance, totalCost.toString());

        expectEvent(receipt2, "EggItemBuy", {
          eggItemContract: eggItemInstance.address,
          owner: user,
          tokenId: new BN(1),
          amount: new BN(1),
          price: totalCost,
        });

        // 1155 approve
        await eggItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        {
          const eggConsumeInput = {
            eggContract: eggInstance.address,
            eggTokenId: tokenId,
            eggItemContract: eggItemInstance.address,
            eggItemTokenId: 1,
            eggItemAmount: 1,
          };

          await expectRevert(
            cockFightInstance.eggConsumeItem(eggConsumeInput, {
              from: user,
            }),
            "revert"
          );
        }

        // egg item 사용 후 실패했으니 안 없어졌으니 1 확인하기
        const afterBalance = (
          await eggItemInstance.balanceOf(user, 1)
        ).toString();

        assert.equal(afterBalance, new BN(1).toString());
      });
      it("알 부화 -> 아이템 사용 -> 부화시간 끝났는 경우 -> 아이템 사용 -> 시도시 에러", async () => {
        const i = 1;

        const [receipt, tokenId] = await buyEgg(user, i);

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        assert.equal(await eggInstance.ownerOf(tokenId), user);

        // 이벤트 확인
        expectEvent(receipt, "BuyEgg", {
          buyer: user,
          price: eggPrice,
          counts: i.toString(),
        });

        // 알 가격 잘 받았는지?
        const protocolBalance = (
          await tokenInstance.balanceOf(protocolEggManagerInstance.address)
        ).toString();

        assert.equal(protocolBalance, eggPrice.toString());

        // 토큰 받기
        await tokenInstance.transfer(
          user,
          web3.utils.toWei("1000000", "ether"),
          {
            from: deployer,
          }
        );

        const itemInfo = await eggItemInstance.tokenURIs(1);
        const eggItemPrice = new BN(itemInfo.price);
        const totalCost = eggItemPrice.mul(new BN(2));

        // approve 없이 egg item 사기
        await expectRevert(
          cockFightInstance.eggItemBuy(new BN(1), new BN(2), {
            from: user,
          }),
          "revert ERC20: insufficient allowance"
        );

        // 실패 햇으니 0
        const afterBalance = (
          await eggItemInstance.balanceOf(user, 1)
        ).toString();

        assert.equal(afterBalance, new BN(0).toString());

        // 토큰 approve
        await tokenInstance.approve(
          cockFightInstance.address,
          web3.utils.toWei("1000000", "ether"),
          {
            from: user,
          }
        );

        // egg item 사기
        const receipt2 = await cockFightInstance.eggItemBuy(
          new BN(1),
          new BN(2),
          {
            from: user,
          }
        );

        // egg item 보유량
        const balance = (
          await eggItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(2).toString());

        // 알 아이템 가격 잘 받았는지?
        const cockfightBalance = (
          await tokenInstance.balanceOf(cockFightInstance.address)
        ).toString();

        assert.equal(cockfightBalance, totalCost.toString());

        expectEvent(receipt2, "EggItemBuy", {
          eggItemContract: eggItemInstance.address,
          owner: user,
          tokenId: new BN(1),
          amount: new BN(2),
          price: totalCost,
        });

        // 날짜 확인
        {
          await checkDate(i);
        }

        // 1155 approve
        await eggItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        {
          const eggConsumeInput = {
            eggContract: eggInstance.address,
            eggTokenId: tokenId,
            eggItemContract: eggItemInstance.address,
            eggItemTokenId: 1,
            eggItemAmount: 1,
          };

          await cockFightInstance.eggConsumeItem(eggConsumeInput, {
            from: user,
          });
        }

        // egg item 사용 후 잔액 1 확인하기
        const itemUseBalance = (
          await eggItemInstance.balanceOf(user, 1)
        ).toString();

        assert.equal(itemUseBalance, new BN(1).toString());

        // 날짜 확인
        {
          await checkDate(i);
        }

        await time.increase(time.duration.days(21));

        // 날짜 확인
        {
          await checkDate(i);
        }

        {
          const eggConsumeInput = {
            eggContract: eggInstance.address,
            eggTokenId: tokenId,
            eggItemContract: eggItemInstance.address,
            eggItemTokenId: 1,
            eggItemAmount: 1,
          };

          await expectRevert(
            cockFightInstance.eggConsumeItem(eggConsumeInput, {
              from: user,
            }),
            "revert"
          );
        }

        // egg item 실패 후 잔액 확인하기
        const itemUse2Balance = (
          await eggItemInstance.balanceOf(user, 1)
        ).toString();

        assert.equal(itemUse2Balance, new BN(1).toString());
      });
    });

    describe("######### 쿡파이트 알 평균 값 구하기 #########", () => {
      it("알 40개 부화 시 수컷 / 암컷 비율", async () => {
        await tokenInstance.transfer(
          user,
          web3.utils.toWei("4000000", "ether"),
          {
            from: deployer,
          }
        );

        const numberOfTokens = 20;

        // approve는 한번만 처리
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          web3.utils.toWei("4000000", "ether"),
          {
            from: user,
          }
        );

        const mintPromises = [];
        for (let i = 1; i <= 2; i++) {
          // Promise 배열에 각 비동기 batchMint 작업을 추가
          mintPromises.push(
            protocolEggManagerInstance.batchMint(numberOfTokens, {
              from: user,
            })
          );
        }
        // 모든 Promise가 완료될 때까지 기다림
        await Promise.all(mintPromises);

        // 21일 후로 시간 이동
        await time.increase(time.duration.days(22));

        // 721 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        let cockerel = 0;
        let pullet = 0;

        for (let i = 1; i <= 40; i += 10) {
          const batchPromises = [];

          for (let j = i; j < i + 10 && j <= 40; j++) {
            batchPromises.push(
              cockFightInstance
                .eggHatch(eggInstance.address, j, {
                  from: user,
                })
                .then((hatchReceipt) => {
                  // 부화된 병아리가 암병아리인지 수병아리인지 확인
                  const event = hatchReceipt.logs.find(
                    (log) => log.event === "EggHatchResult"
                  );
                  const chickContractAddress = event.args.chickContract;

                  if (chickContractAddress === pulletChickInstance.address) {
                    pullet++;
                  } else if (
                    chickContractAddress === cockerelChickInstance.address
                  ) {
                    cockerel++;
                  }
                })
            );
          }

          // Wait for each batch of 10 to complete before proceeding
          await Promise.all(batchPromises);
        }

        // 결과
        console.log("       수병아리: " + cockerel + " 암병아리" + pullet);

        // 스탯 체크
        for (let i = 1; i <= cockerel; i++) {
          const statInfo = await cockerelChickInstance.stats(i);

          const attack = new BN(statInfo.attack);
          const attackSpeed = new BN(statInfo.attackSpeed);
          const critChance = new BN(statInfo.critChance);
          const health = new BN(statInfo.health);
          const evasion = new BN(statInfo.evasion);

          const totalStats = attack
            .add(attackSpeed)
            .add(critChance)
            .add(health)
            .add(evasion);

          console.log(
            "attack : ",
            attack.toString(),
            " attackSpeed : ",
            attackSpeed.toString(),
            " critChance : ",
            critChance.toString(),
            " health : ",
            health.toString(),
            " evasion : ",
            evasion.toString(),
            " Total Stats : ",
            totalStats.toString()
          );
        }
      });
    });
  }
);
