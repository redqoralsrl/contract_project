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
  "-------------------- 3_cockfight.test.js 병아리 강화 / 성장 케이스 --------------------",
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

    // 부화까지 시키는 함수
    const hatchChick = async (userAddress, i) => {
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
      await protocolEggManagerInstance.singleMint({
        from: userAddress,
      });

      // 21일 이상 기간 지나기
      await time.increase(time.duration.days(22));

      // 알 721을 cockfight 에 approve
      await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
        from: userAddress,
      });

      // 알 부화
      const hatchReceipt = await cockFightInstance.eggHatch(
        eggInstance.address,
        i,
        { from: userAddress }
      );

      const event = hatchReceipt.logs.find(
        (log) => log.event === "EggHatchResult"
      );
      return [event.args.chickContract, event.args.tokenId];
    };

    const checkDate = async (i) => {
      const chickInfo = await cockFightInstance.getCockerelChickCalculate(i);

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

    describe("######### 쿡파이트 수병아리 테스트 #########", () => {
      it("병아리 부화 퍼센테이지 계산 - 10마리 기준 암컷 비율", async () => {
        let pullet = 0;
        let cockerel = 0;
        for (let i = 1; i <= 10; i++) {
          const [chickContractAddress, chickTokenId] = await hatchChick(
            user,
            i
          );
          if (chickContractAddress !== cockerelChickInstance.address) {
            pullet++;
          } else {
            cockerel++;
          }
        }
        const totalChicks = pullet + cockerel;
        const pulletPercentage = (pullet / totalChicks) * 100;
        console.log(
          `       Pullet 10마리 기준 퍼센테이지: ${pulletPercentage.toFixed(
            2
          )}%`
        );
      });
      it("수병아리 성장 촉진 아이템 사용 테스트", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       암탉 나옴 강화 없음!");
        } else if (chickContractAddress === cockerelChickInstance.address) {
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
          // 1155 buy
          await cockFightInstance.chickItemBuy(1, 10, {
            from: user,
          });
          {
            await checkDate(chickTokenId);
          }
          // 1155 approve
          await chickItemInstance.setApprovalForAll(
            cockFightInstance.address,
            true,
            {
              from: user,
            }
          );
          const chickConsume = {
            CockerelChickContract: cockerelChickInstance.address,
            CockerelChickTokenId: chickTokenId.toString(),
            PulletChickContract: "0x0000000000000000000000000000000000000000",
            PulletChickTokenId: 0,
            chickItemContract: chickItemInstance.address,
            chickItemTokenId: 1,
            chickItemAmount: 1,
          };
          // 성장 촉진 사용
          await cockFightInstance.chickConsumeItem(chickConsume, {
            from: user,
          });
          {
            await checkDate(chickTokenId);
          }
        }
      });
      it("Attack 1회 강화 테스트", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       암탉 나옴 강화 없음!");
        } else if (chickContractAddress === cockerelChickInstance.address) {
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
          await cockFightInstance.chickItemBuy(2, 10, {
            from: user,
          });
          {
            const statInfo = await cockerelChickInstance.stats(1);
            // 이전 스탯 확인
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
              "       attack : ",
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
          // 1155 approve
          await chickItemInstance.setApprovalForAll(
            cockFightInstance.address,
            true,
            {
              from: user,
            }
          );
          // 721 approve
          await cockerelChickInstance.setApprovalForAll(
            cockFightInstance.address,
            true,
            {
              from: user,
            }
          );
          const chickConsume = {
            CockerelChickContract: cockerelChickInstance.address,
            CockerelChickTokenId: chickTokenId.toString(),
            PulletChickContract: "0x0000000000000000000000000000000000000000",
            PulletChickTokenId: 0,
            chickItemContract: chickItemInstance.address,
            chickItemTokenId: 2,
            chickItemAmount: 1,
          };
          const consumeReceipt = await cockFightInstance.chickConsumeItem(
            chickConsume,
            { from: user }
          );
          // 포인트 / 사망 확인
          const event = consumeReceipt.logs.find(
            (log) => log.event === "ChickConsumeItemStats"
          );
          const points = event.args.point;
          const isDead = event.args.isDead;
          console.log(
            "       강화 : ",
            points.toString(),
            " 포인트, 뒤짐?:",
            isDead
          );
          {
            const statInfo = await cockerelChickInstance.stats(1);
            // 이후 스탯 확인
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
              "       attack : ",
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
        }
      });
      it("수병아리 부화 후 스탯이 10과 부화 날짜 잘 적용됬는지?", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       암탉 나옴 강화 없음!");
        } else if (chickContractAddress === cockerelChickInstance.address) {
          // 수병아리 기본 부화시간
          const growTime = await cockerelChickInstance.ChickGrowTime();
          // 부화 정보가 담긴 정보
          const grow = await cockerelChickInstance.grow(chickTokenId);
          const currentTimestamp = new BN(grow.currentTimestamp).toNumber();
          const timestamp30Days = new BN(grow.timestamp30Days).toNumber();
          // 부화 정보 잘 반영됬는지?
          assert.equal(
            timestamp30Days - currentTimestamp,
            new BN(growTime).toNumber()
          );
          // 스탯 정보가 담긴 정보
          const stats = await cockerelChickInstance.stats(chickTokenId);
          const attack = new BN(stats.attack);
          const attackSpeed = new BN(stats.attackSpeed);
          const critChance = new BN(stats.critChance);
          const health = new BN(stats.health);
          const evasion = new BN(stats.evasion);
          // 스탯 10인지 체크
          assert.equal(
            attack.toNumber() +
              attackSpeed.toNumber() +
              critChance.toNumber() +
              health.toNumber() +
              evasion.toNumber(),
            10
          );
        }
      });
      it("수병아리 시간 지난 후 수닭으로 잘변하는지?", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));
        {
          await checkDate(1);
        }
        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        const growReceipt = await cockFightInstance.cockerelChickGrow(
          cockerelChickInstance.address,
          chickTokenId,
          { from: user }
        );
        // 부화된 병아리가 암병아리인지 수병아리인지 확인
        const event = growReceipt.logs.find((log) => log.event === "CockMint");
        // 민트 이벤트 확인
        assert.equal(event.args.owner, user);
        // burn 확인
        assert.equal(
          await cockerelChickInstance.ownerOf(1),
          "0x000000000000000000000000000000000000dEaD"
        );
        // mint 확인
        assert.equal(await cockInstance.ownerOf(1), user);
      });
      it("수병아리 100일 지나도 부화하는지?", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(100));
        {
          await checkDate(1);
        }
        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        const growReceipt = await cockFightInstance.cockerelChickGrow(
          cockerelChickInstance.address,
          chickTokenId,
          { from: user }
        );
        // 부화된 병아리가 암병아리인지 수병아리인지 확인
        const event = growReceipt.logs.find((log) => log.event === "CockMint");
        // 민트 이벤트 확인
        assert.equal(event.args.owner, user);
        // burn 확인
        assert.equal(
          await cockerelChickInstance.ownerOf(1),
          "0x000000000000000000000000000000000000dEaD"
        );
        // mint 확인
        assert.equal(await cockInstance.ownerOf(1), user);
      });
      it("수병아리 부화 후 수닭에 스탯 잘 갔는지?", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));
        {
          await checkDate(1);
        }
        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        const growReceipt = await cockFightInstance.cockerelChickGrow(
          cockerelChickInstance.address,
          chickTokenId,
          { from: user }
        );
        // 부화된 병아리가 암병아리인지 수병아리인지 확인
        const event = growReceipt.logs.find((log) => log.event === "CockMint");
        // 민트 이벤트 확인
        assert.equal(event.args.owner, user);
        // burn 확인
        assert.equal(
          await cockerelChickInstance.ownerOf(1),
          "0x000000000000000000000000000000000000dEaD"
        );
        // mint 확인
        assert.equal(await cockInstance.ownerOf(1), user);
        // 스탯 확인
        // 스탯 정보가 담긴 정보
        const stats = await cockerelChickInstance.stats(chickTokenId);
        const attack = new BN(stats.attack);
        const attackSpeed = new BN(stats.attackSpeed);
        const critChance = new BN(stats.critChance);
        const health = new BN(stats.health);
        const evasion = new BN(stats.evasion);
        const cockStats = await cockInstance.stats(1);
        const cockAttack = new BN(cockStats.attack);
        const cockAttackSpeed = new BN(cockStats.attackSpeed);
        const cockCritChance = new BN(cockStats.critChance);
        const cockHealth = new BN(cockStats.health);
        const cockEvasion = new BN(cockStats.evasion);
        assert.equal(attack.toNumber(), cockAttack.toNumber());
        assert.equal(attackSpeed.toNumber(), cockAttackSpeed.toNumber());
        assert.equal(critChance.toNumber(), cockCritChance.toNumber());
        assert.equal(health.toNumber(), cockHealth.toNumber());
        assert.equal(evasion.toNumber(), cockEvasion.toNumber());
      });
      it("수병아리 부화 후 성장 아이템 사용하여 빠르게 수닭으로 변하는지?", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
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
        // 1155 buy
        await cockFightInstance.chickItemBuy(1, 30, {
          from: user,
        });
        {
          await checkDate(chickTokenId);
        }
        // 1155 approve
        await chickItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        const chickConsume = {
          CockerelChickContract: cockerelChickInstance.address,
          CockerelChickTokenId: chickTokenId.toString(),
          PulletChickContract: "0x0000000000000000000000000000000000000000",
          PulletChickTokenId: 0,
          chickItemContract: chickItemInstance.address,
          chickItemTokenId: 1,
          chickItemAmount: 30,
        };
        // 성장 촉진 사용
        await cockFightInstance.chickConsumeItem(chickConsume, {
          from: user,
        });
        {
          await checkDate(chickTokenId);
        }
        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        const growReceipt = await cockFightInstance.cockerelChickGrow(
          cockerelChickInstance.address,
          chickTokenId,
          { from: user }
        );
        // 이벤트
        const event = growReceipt.logs.find((log) => log.event === "CockMint");
        // 민트 이벤트 확인
        assert.equal(event.args.owner, user);
        // burn 확인
        assert.equal(
          await cockerelChickInstance.ownerOf(1),
          "0x000000000000000000000000000000000000dEaD"
        );
        // mint 확인
        assert.equal(await cockInstance.ownerOf(1), user);
      });
      it("강화 확률 10번 시도 테스트 - 공격만", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }
        // 토큰 받기
        await tokenInstance.transfer(
          user,
          web3.utils.toWei("1000000", "ether"),
          {
            from: deployer,
          }
        );
        // ChickItem 구매
        await tokenInstance.approve(
          cockFightInstance.address,
          web3.utils.toWei("10000", "ether"),
          {
            from: user,
          }
        );
        await cockFightInstance.chickItemBuy(2, 10, { from: user });
        // 1155 approve
        await chickItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        // 강화 시도 결과 기록
        const report = [];
        let isFull = false;
        let isFullCount = 0;
        let isDeadChick = false;
        for (let i = 0; i < 10; i++) {
          const statInfoCheck = await cockerelChickInstance.stats(1);
          const attackCheck = new BN(statInfoCheck.attack);
          if (attackCheck.toString() == "10") {
            isFull = true;
            isFullCount = 10 - i - 1;
            break;
          }
          const chickConsume = {
            CockerelChickContract: cockerelChickInstance.address,
            CockerelChickTokenId: chickTokenId.toString(),
            PulletChickContract: "0x0000000000000000000000000000000000000000",
            PulletChickTokenId: 0,
            chickItemContract: chickItemInstance.address,
            chickItemTokenId: 2, // 공격력 강화 아이템으로 시도
            chickItemAmount: 1,
          };
          const consumeReceipt = await cockFightInstance.chickConsumeItem(
            chickConsume,
            {
              from: user,
            }
          );
          // 강화 결과 확인
          const consumeEvent = consumeReceipt.logs.find(
            (log) => log.event === "ChickConsumeItemStats"
          );
          const points = consumeEvent.args.point;
          const isDead = consumeEvent.args.isDead;
          const statInfo = await cockerelChickInstance.stats(1);
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
          // 리포트에 결과 추가
          report.push({
            attempt: i + 1 + "회차",
            points: points.toString(),
            isDead: isDead ? "Yes" : "No",
            attack: attack.toString(),
            totalStats: totalStats.toString(),
          });
          if (attack.toString() == "10") {
            isFull = true;
            isFullCount = 10 - i - 1;
            break;
          }
          if (isDead) {
            isDeadChick = true;
            break;
          }
        }
        // 리포트 출력
        console.log("      강화 시도 리포트: ", report);
        if (isFull) {
          console.log(
            "        강화 10 스텟 달성 종료합니다. 남은 횟수 : ",
            isFullCount
          );
        }
        if (isDeadChick) {
          console.log("       병아리가 죽어서 테스트를 종료합니다.");
        }
      });
      it("강화 확률 다양한 아이템으로 10번 시도 테스트", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }
        // 토큰 받기
        await tokenInstance.transfer(
          user,
          web3.utils.toWei("1000000", "ether"),
          {
            from: deployer,
          }
        );
        // ChickItem 구매 (각각의 스탯을 10번 강화할 수 있도록 아이템을 충분히 구매)
        await tokenInstance.approve(
          cockFightInstance.address,
          web3.utils.toWei("10000", "ether"),
          {
            from: user,
          }
        );
        await cockFightInstance.chickItemBuy(2, 10, { from: user }); // 공격력 아이템
        await cockFightInstance.chickItemBuy(3, 10, { from: user }); // 공격 속도 아이템
        await cockFightInstance.chickItemBuy(4, 10, { from: user }); // 치명타 확률 아이템
        await cockFightInstance.chickItemBuy(5, 10, { from: user }); // 체력 아이템
        await cockFightInstance.chickItemBuy(6, 10, { from: user }); // 회피 아이템
        // 강화 시도 결과 기록
        const report = [];
        const items = [2, 3, 4, 5, 6]; // 각 아이템의 tokenId 목록
        let currentItemIndex = 0;
        // 1155 approve
        await chickItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        let isDeadChick = false;
        for (let i = 0; i < 10; i++) {
          const chickConsume = {
            CockerelChickContract: cockerelChickInstance.address,
            CockerelChickTokenId: chickTokenId.toString(),
            PulletChickContract: "0x0000000000000000000000000000000000000000",
            PulletChickTokenId: 0,
            chickItemContract: chickItemInstance.address,
            chickItemTokenId: items[currentItemIndex], // 아이템 순환 적용
            chickItemAmount: 1,
          };
          const consumeReceipt = await cockFightInstance.chickConsumeItem(
            chickConsume,
            {
              from: user,
            }
          );
          // 강화 결과 확인
          const consumeEvent = consumeReceipt.logs.find(
            (log) => log.event === "ChickConsumeItemStats"
          );
          const points = consumeEvent.args.point;
          const isDead = consumeEvent.args.isDead;
          const statInfo = await cockerelChickInstance.stats(1);
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
          // 리포트에 결과 추가
          report.push({
            attempt: i + 1 + "회차",
            itemUsed: items[currentItemIndex], // 사용한 아이템 종류
            points: points.toString(),
            isDead: isDead ? "Yes" : "No",
            attack: attack.toString(),
            attackSpeed: attackSpeed.toString(),
            critChance: critChance.toString(),
            health: health.toString(),
            evasion: evasion.toString(),
            totalStats: totalStats.toString(),
          });
          // 병아리가 죽으면 테스트 종료
          if (isDead) {
            isDeadChick = true;
            break;
          }
          // 다음 강화 시도에 다른 아이템을 사용하기 위해 index를 순환
          currentItemIndex = (currentItemIndex + 1) % items.length;
          // 10번 강화시 0번 횟수 체크
          if (i == 9) {
            const counts = await cockerelChickInstance.upgradeCounts(
              chickTokenId.toString()
            );
            assert.equal(counts.toNumber(), 0);
          }
        }
        // 리포트 출력
        console.log("       강화 시도 리포트: ", report);
        if (isDeadChick) {
          console.log("       병아리가 죽어서 테스트를 종료합니다.");
        }
      });
    });

    describe("######### 쿡파이트 병아리 아이템 사용 및 강화 에러 테스트 #########", () => {
      it("수병아리 부화 후 30일 이후에 부화 날짜 감소 아이템 강화시도", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);

        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));
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
        await cockFightInstance.chickItemBuy(1, 10, {
          from: user,
        });
        // 1155 approve
        await chickItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );
        const chickConsumeJson = {
          CockerelChickContract:
            chickContractAddress == cockerelChickInstance.address
              ? cockerelChickInstance.address
              : "0x0000000000000000000000000000000000000000",
          CockerelChickTokenId:
            chickContractAddress == cockerelChickInstance.address
              ? chickTokenId.toString()
              : 0,
          PulletChickContract:
            chickContractAddress == pulletChickInstance.address
              ? pulletChickInstance.address
              : "0x0000000000000000000000000000000000000000",
          PulletChickTokenId:
            chickContractAddress == pulletChickInstance.address
              ? chickTokenId.toString()
              : 0,
          chickItemContract: chickItemInstance.address,
          chickItemTokenId: 1,
          chickItemAmount: 1,
        };
        if (chickContractAddress == cockerelChickInstance.address) {
          const day = await cockFightInstance.getCockerelChickCalculate(
            chickTokenId.toString()
          );
          console.log("       남은 날짜 : ", day.timestampRemaining.toString());
        } else {
          const day = await cockFightInstance.getPulletChickCalculate(
            chickTokenId.toString()
          );
          console.log("       남은 날짜 : ", day.timestampRemaining.toString());
        }
        await expectRevert(
          cockFightInstance.chickConsumeItem(chickConsumeJson, {
            from: user,
          }),
          "revert"
        );
      });
      it("수병아리 부화 후 강화 아이템 approve 안할 시 에러", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
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
        // 강화 아이템 사기
        await cockFightInstance.chickItemBuy(2, 10, {
          from: user,
        });
        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       암탉 나옴 강화 없음!");
        } else if (chickContractAddress === cockerelChickInstance.address) {
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
          const chickConsume = {
            CockerelChickContract: cockerelChickInstance.address,
            CockerelChickTokenId: chickTokenId.toString(),
            PulletChickContract: "0x0000000000000000000000000000000000000000",
            PulletChickTokenId: 0,
            chickItemContract: chickItemInstance.address,
            chickItemTokenId: 2,
            chickItemAmount: 1,
          };
          // 721 , 1155 approve 안할 시 에러
          await expectRevert(
            cockFightInstance.chickConsumeItem(chickConsume, { from: user }),
            "revert"
          );
          // 1155 approve
          await chickItemInstance.setApprovalForAll(
            cockFightInstance.address,
            true,
            {
              from: user,
            }
          );
          // 721 approve 안할 시 에러
          await expectRevert(
            cockFightInstance.chickConsumeItem(chickConsume, { from: user }),
            "revert"
          );
          // 721 approve
          await cockerelChickInstance.setApprovalForAll(
            cockFightInstance.address,
            true,
            {
              from: user,
            }
          );
          // 강화
          await cockFightInstance.chickConsumeItem(chickConsume, {
            from: user,
          });
          assert.equal(await cockerelChickInstance.ownerOf(chickTokenId), user);
          const itemUse2Balance = (
            await chickItemInstance.balanceOf(user, 2)
          ).toString();
          // 아이템 감소 확인
          assert.equal(itemUse2Balance, new BN(9).toString());
        }
      });
      it("수병아리 암닭 부화 함수 작동 시 에러", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);

        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }

        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));

        {
          await checkDate(1);
        }

        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        // 암닭 부화
        await expectRevert(
          cockFightInstance.pulletChickGrow(
            pulletChickInstance.address,
            chickTokenId,
            { from: user }
          ),
          "revert ERC721: invalid token ID"
        );

        // 암닭 tokenId가 있을 경우 수닭으로 부화시 에러 체크
        const pulletMint = async (userAddress) => {
          const receipt = await pulletChickInstance.mint(userAddress);

          const event = receipt.logs.find((log) => log.event === "ChickGrow");

          return [receipt, event.args.tokenId];
        };

        const [receipt, tokenId] = await pulletMint(deployer);

        // 암닭 부화
        await expectRevert(
          cockFightInstance.pulletChickGrow(
            pulletChickInstance.address,
            chickTokenId,
            { from: user }
          ),
          "revert"
        );

        // 암닭은 user/deployer가 approve한 상태의 경우 에러
        // 721 approve
        await pulletChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        await pulletChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: deployer,
          }
        );

        // 암닭 부화
        await expectRevert(
          cockFightInstance.pulletChickGrow(
            pulletChickInstance.address,
            tokenId,
            { from: user }
          ),
          "revert"
        );
      });
      it("수병아리 approve 없이 수닭 부화시 에러", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));

        {
          await checkDate(1);
        }

        // 성장
        await expectRevert(
          cockFightInstance.cockerelChickGrow(
            cockerelChickInstance.address,
            chickTokenId,
            { from: user }
          ),
          "revert ERC721: caller is not token owner or approved"
        );

        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        await cockFightInstance.cockerelChickGrow(
          cockerelChickInstance.address,
          chickTokenId,
          { from: user }
        );

        // burn 확인
        assert.equal(
          await cockerelChickInstance.ownerOf(chickTokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        // mint 확인
        assert.equal(await cockInstance.ownerOf(1), user);
      });
      it("수병아리 30일 안 지났는데 수닭 부화 작동시 에러", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);
        if (chickContractAddress !== cockerelChickInstance.address) {
          console.log("       수병아리가 아닙니다. 테스트를 종료합니다.");
          return;
        }

        {
          await checkDate(1);
        }

        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        await expectRevert(
          cockFightInstance.cockerelChickGrow(
            cockerelChickInstance.address,
            chickTokenId,
            { from: user }
          ),
          "revert"
        );

        // 5일 이상 기간 지나기
        await time.increase(time.duration.days(5));

        {
          await checkDate(1);
        }

        await expectRevert(
          cockFightInstance.cockerelChickGrow(
            cockerelChickInstance.address,
            chickTokenId,
            { from: user }
          ),
          "revert"
        );

        // 25일 이상 기간 지나기
        await time.increase(time.duration.days(25));

        {
          await checkDate(1);
        }

        await cockFightInstance.cockerelChickGrow(
          cockerelChickInstance.address,
          chickTokenId,
          { from: user }
        );

        // burn 확인
        assert.equal(
          await cockerelChickInstance.ownerOf(chickTokenId),
          "0x000000000000000000000000000000000000dEaD"
        );

        // mint 확인
        assert.equal(await cockInstance.ownerOf(1), user);
      });
      it("수병아리 30일 지났는데 강화 아이템 사용시 에러", async () => {
        const [chickContractAddress, chickTokenId] = await hatchChick(user, 1);

        if (chickContractAddress === pulletChickInstance.address) {
          console.log("       암탉 나옴 강화 없음!");
        } else if (chickContractAddress === cockerelChickInstance.address) {
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
          await cockFightInstance.chickItemBuy(2, 10, {
            from: user,
          });
          {
            const statInfo = await cockerelChickInstance.stats(chickTokenId);
            // 이전 스탯 확인
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
              "       attack : ",
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
          // 1155 approve
          await chickItemInstance.setApprovalForAll(
            cockFightInstance.address,
            true,
            {
              from: user,
            }
          );
          // 721 approve
          await cockerelChickInstance.setApprovalForAll(
            cockFightInstance.address,
            true,
            {
              from: user,
            }
          );

          // 30일 이상 기간 지나기
          await time.increase(time.duration.days(30));

          const chickConsume = {
            CockerelChickContract: cockerelChickInstance.address,
            CockerelChickTokenId: chickTokenId.toString(),
            PulletChickContract: "0x0000000000000000000000000000000000000000",
            PulletChickTokenId: 0,
            chickItemContract: chickItemInstance.address,
            chickItemTokenId: 2,
            chickItemAmount: 1,
          };
          await expectRevert(
            cockFightInstance.chickConsumeItem(chickConsume, { from: user }),
            "revert"
          );

          {
            await checkDate(chickTokenId.toString());
          }
          {
            const statInfo = await cockerelChickInstance.stats(chickTokenId);
            // 이전 스탯 확인
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
              "       attack : ",
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
        }
      });
    });
  }
);
