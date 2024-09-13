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
  "-------------------- 4_cockfight.test.js 암병아리 강화 / 성장 케이스 --------------------",
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

    const pulletMint = async (userAddress) => {
      const receipt = await pulletChickInstance.mint(userAddress);

      const event = receipt.logs.find((log) => log.event === "ChickGrow");

      return [receipt, event.args.tokenId];
    };

    const checkDate = async (i) => {
      const chickInfo = await cockFightInstance.getPulletChickCalculate(i);

      const timestampRemaining = chickInfo.timestampRemaining.toNumber();

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

    describe("######### 쿡파이트 암병아리 성장아이템 테스트 #########", () => {
      it("암 병아리 만든 후 정보 맞는지", async () => {
        const [receipt, tokenId] = await pulletMint(user);

        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);

        const timeInfo = await pulletChickInstance.ChickGrowTime();

        const pulletInfo = await pulletChickInstance.grow(tokenId);

        const res =
          pulletInfo.timestamp30Days.toNumber() -
          pulletInfo.currentTimestamp.toNumber();

        assert.equal(res, timeInfo.toNumber());
        assert.equal(
          pulletInfo.timestamp30Days.toNumber(),
          pulletInfo.currentTimestamp.toNumber() + timeInfo.toNumber()
        );
      });
      it("암 병아리 아이템 성장 아이템 사용 테스트", async () => {
        const [receipt, tokenId] = await pulletMint(user);

        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);

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

        // 아이템 사기
        await cockFightInstance.chickItemBuy(1, 10, {
          from: user,
        });

        // chick item 보유량
        const balance = (
          await chickItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(10));

        // 1155 approve
        await chickItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        const chickConsumeJson = {
          CockerelChickContract: "0x0000000000000000000000000000000000000000",
          CockerelChickTokenId: 0,
          PulletChickContract: pulletChickInstance.address,
          PulletChickTokenId: tokenId.toString(),
          chickItemContract: chickItemInstance.address,
          chickItemTokenId: 1,
          chickItemAmount: 1,
        };

        // 성장 남은 날짜 확인
        await checkDate(1);

        // 날짜 감소 아이템 사용
        await cockFightInstance.chickConsumeItem(chickConsumeJson, {
          from: user,
        });

        // nft 보유 확인
        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);

        // chick item 보유량
        const balance2 = (
          await chickItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance2, new BN(9));

        // 성장 남은 날짜 확인
        await checkDate(1);
      });
      it("암 병아리 시간 지난 후 암닭으로 잘 변하는지 테스트", async () => {
        const [receipt, tokenId] = await pulletMint(user);

        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);

        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));

        // 721 approve
        await pulletChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        // grow
        await cockFightInstance.pulletChickGrow(
          pulletChickInstance.address,
          tokenId,
          {
            from: user,
          }
        );

        assert.equal(
          await pulletChickInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        assert.equal(await henInstance.ownerOf(tokenId), user);
      });
      it("암 병아리 아이템 사용 후 암닭으로 잘 변하는지?", async () => {
        const [receipt, tokenId] = await pulletMint(user);

        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);

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

        // 아이템 사기
        await cockFightInstance.chickItemBuy(1, 30, {
          from: user,
        });

        // chick item 보유량
        const balance = (
          await chickItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(30));

        // 1155 approve
        await chickItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        {
          await checkDate(1);
        }

        const chickConsumeJson = {
          CockerelChickContract: "0x0000000000000000000000000000000000000000",
          CockerelChickTokenId: 0,
          PulletChickContract: pulletChickInstance.address,
          PulletChickTokenId: tokenId.toString(),
          chickItemContract: chickItemInstance.address,
          chickItemTokenId: 1,
          chickItemAmount: 30,
        };

        await cockFightInstance.chickConsumeItem(chickConsumeJson, {
          from: user,
        });

        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);

        // chick item 보유량
        const balance2 = (
          await chickItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance2, new BN(0));

        {
          await checkDate(1);
        }

        // 721 approve
        await pulletChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        // 암병아리 성장
        await cockFightInstance.pulletChickGrow(
          pulletChickInstance.address,
          1,
          {
            from: user,
          }
        );

        // 암병아리 burn 체크
        assert.equal(
          await pulletChickInstance.ownerOf(1),
          "0x000000000000000000000000000000000000dEaD"
        );

        // 암닭 부화 확인
        assert.equal(await henInstance.ownerOf(1), user);
      });
      it("암 병아리 100일 지나도 암닭으로 부화 잘되는지?", async () => {
        const [receipt, tokenId] = await pulletMint(user);

        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);

        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(100));

        // 721 approve
        await pulletChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        // grow
        await cockFightInstance.pulletChickGrow(
          pulletChickInstance.address,
          tokenId,
          {
            from: user,
          }
        );

        assert.equal(
          await pulletChickInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        assert.equal(await henInstance.ownerOf(1), user);
      });
    });

    describe("######### 쿡파이트 암병아리 에러 케이스 #########", () => {
      it("암병아리 수병아리 아이템 사용시 에러", async () => {
        const [receipt, tokenId] = await pulletMint(user);
        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);
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
        // 아이템 사기
        await cockFightInstance.chickItemBuy(2, 1, {
          from: user,
        });
        // chick item 보유량
        const balance = (
          await chickItemInstance.balanceOf(user, new BN(2))
        ).toString();
        assert.equal(balance, new BN(1));
        // 1155 approve
        await chickItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        const chickConsumeJson = {
          CockerelChickContract: "0x0000000000000000000000000000000000000000",
          CockerelChickTokenId: 0,
          PulletChickContract: pulletChickInstance.address,
          PulletChickTokenId: tokenId.toString(),
          chickItemContract: chickItemInstance.address,
          chickItemTokenId: 2,
          chickItemAmount: 1,
        };
        // 강화 아이템 사용
        await expectRevert(
          cockFightInstance.chickConsumeItem(chickConsumeJson, {
            from: user,
          }),
          "revert No items"
        );
      });
      it("암병아리 암닭으로 변할때 approve 없으면 에러", async () => {
        const [receipt, tokenId] = await pulletMint(user);
        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));
        // 암병아리 721 approve X시 에러
        await expectRevert(
          cockFightInstance.pulletChickGrow(
            pulletChickInstance.address,
            tokenId,
            {
              from: user,
            }
          ),
          "revert ERC721: caller is not token owner or approved"
        );
      });
      it("암병아리 수닭 부화 함수 작동 시 에러", async () => {
        const [receipt, tokenId] = await pulletMint(user);
        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));
        // 암병아리 721 에러
        await expectRevert(
          cockFightInstance.cockerelChickGrow(
            pulletChickInstance.address,
            tokenId,
            {
              from: user,
            }
          ),
          "revert"
        );
        // 721 approve
        await pulletChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        // 암병아리 approve해도 721 에러
        await expectRevert(
          cockFightInstance.cockerelChickGrow(
            pulletChickInstance.address,
            tokenId,
            {
              from: user,
            }
          ),
          "revert"
        );
      });
      it("30일 안 지났는데 암닭 부화하는거 작동시 에러", async () => {
        const [receipt, tokenId] = await pulletMint(user);
        assert.equal(await pulletChickInstance.ownerOf(tokenId), user);
        // 721 approve
        await pulletChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        // grow
        await expectRevert(
          cockFightInstance.pulletChickGrow(
            pulletChickInstance.address,
            tokenId,
            {
              from: user,
            }
          ),
          "revert"
        );
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));
        // grow
        await cockFightInstance.pulletChickGrow(
          pulletChickInstance.address,
          tokenId,
          {
            from: user,
          }
        );
        assert.equal(
          await pulletChickInstance.ownerOf(tokenId),
          "0x000000000000000000000000000000000000dEaD"
        );
        assert.equal(await henInstance.ownerOf(tokenId), user);
      });
    });
  }
);
