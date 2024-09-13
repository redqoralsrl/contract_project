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
  "-------------------- 쿡파이트 수닭 테스트 --------------------",
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

    const hatchGrowCock = async (userAddress, i) => {
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

      if (cockerelChickInstance.address == event.args.chickContract) {
        // 30일 이상 기간 지나기
        await time.increase(time.duration.days(31));

        // 721 approve
        await cockerelChickInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: userAddress,
          }
        );

        const growReceipt = await cockFightInstance.cockerelChickGrow(
          cockerelChickInstance.address,
          event.args.tokenId,
          { from: userAddress }
        );

        // 부화된 병아리가 암병아리인지 수병아리인지 확인
        const event2 = growReceipt.logs.find((log) => log.event === "CockMint");
        // 민트 이벤트 확인
        assert.equal(event2.args.owner, userAddress);
        // burn 확인
        assert.equal(
          await cockerelChickInstance.ownerOf(i),
          "0x000000000000000000000000000000000000dEaD"
        );
        // mint 확인
        assert.equal(await cockInstance.ownerOf(i), userAddress);

        return i;
      } else {
        return undefined;
      }
    };

    describe("######### 쿡파이트 수닭 테스트 #########", async () => {
      it("게임정보, 스탯 잘 들어갔는지", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 병아리 정보 - 병아리, 닭 같은 tokenId인 경우
        const cockerelGrow = await cockerelChickInstance.grow(tokenId);
        const cockerelStats = await cockerelChickInstance.stats(tokenId);

        // 닭 정보
        const cockStats = await cockInstance.stats(tokenId);

        {
          // 수병아리 부화 정보 확인

          // 수병아리 기본 부화시간
          const growTime = await cockerelChickInstance.ChickGrowTime();
          // 부화 정보가 담긴 정보
          const currentTimestamp = new BN(
            cockerelGrow.currentTimestamp
          ).toNumber();
          const timestamp30Days = new BN(
            cockerelGrow.timestamp30Days
          ).toNumber();

          // 부화 정보 잘 반영됬는지?
          assert.equal(
            timestamp30Days - currentTimestamp,
            new BN(growTime).toNumber()
          );
        }

        // 스탯
        {
          // 병아리 스탯
          const attack = new BN(cockerelStats.attack);
          const attackSpeed = new BN(cockerelStats.attackSpeed);
          const critChance = new BN(cockerelStats.critChance);
          const health = new BN(cockerelStats.health);
          const evasion = new BN(cockerelStats.evasion);
          const totalStats = attack
            .add(attackSpeed)
            .add(critChance)
            .add(health)
            .add(evasion);

          assert.equal(totalStats.toNumber(), 10);

          // 수닭 스탯
          const cockAttack = new BN(cockStats.attack);
          const cockAttackSpeed = new BN(cockStats.attackSpeed);
          const cockCritChance = new BN(cockStats.critChance);
          const cockHealth = new BN(cockStats.health);
          const cockEvasion = new BN(cockStats.evasion);
          const cockTotalStats = cockAttack
            .add(cockAttackSpeed)
            .add(cockCritChance)
            .add(cockHealth)
            .add(cockEvasion);

          assert.equal(cockTotalStats.toNumber(), 10);

          assert.equal(attack.toNumber(), cockAttack.toNumber());
          assert.equal(attackSpeed.toNumber(), cockAttackSpeed.toNumber());
          assert.equal(critChance.toNumber(), cockCritChance.toNumber());
          assert.equal(health.toNumber(), cockHealth.toNumber());
          assert.equal(evasion.toNumber(), cockEvasion.toNumber());
        }

        // 게임
        {
          const cockGame = await cockInstance.game(tokenId);

          assert.equal(cockGame.status.toNumber(), 0);
          assert.equal(cockGame.win.toNumber(), 0);
          assert.equal(cockGame.lose.toNumber(), 0);
        }
      });
      it("강화했으면 강화한걸로 스탯 잘 반영되었는지?", async () => {
        const i = 1;

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        await tokenInstance.transfer(user, eggPrice, { from: deployer });
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          eggPrice,
          {
            from: user,
          }
        );

        // 알 민팅
        await protocolEggManagerInstance.singleMint({
          from: user,
        });

        // 21일 이상 기간 지나기
        await time.increase(time.duration.days(22));

        // 알 721을 cockfight 에 approve
        await eggInstance.setApprovalForAll(cockFightInstance.address, true, {
          from: user,
        });

        // 알 부화
        const hatchReceipt = await cockFightInstance.eggHatch(
          eggInstance.address,
          i,
          { from: user }
        );

        const event = hatchReceipt.logs.find(
          (log) => log.event === "EggHatchResult"
        );

        if (cockerelChickInstance.address == event.args.chickContract) {
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
            CockerelChickTokenId: i,
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
          const isDead = event.args.isDead;

          if (isDead) {
            console.log("강화하다 뒤져서 실패...");
          } else {
            // 30일 이상 기간 지나기
            await time.increase(time.duration.days(31));

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
              i,
              { from: user }
            );

            // mint 확인
            assert.equal(await cockInstance.ownerOf(i), user);

            // 병아리 정보 - 병아리, 닭 같은 tokenId인 경우
            const cockerelStats = await cockerelChickInstance.stats(i);

            // 닭 정보
            const cockStats = await cockInstance.stats(i);

            // 스탯
            {
              // 병아리 스탯
              const attack = new BN(cockerelStats.attack);
              const attackSpeed = new BN(cockerelStats.attackSpeed);
              const critChance = new BN(cockerelStats.critChance);
              const health = new BN(cockerelStats.health);
              const evasion = new BN(cockerelStats.evasion);
              const totalStats = attack
                .add(attackSpeed)
                .add(critChance)
                .add(health)
                .add(evasion);

              assert.equal(
                totalStats.toNumber(),
                10 + event.args.point.toNumber()
              );

              // 수닭 스탯
              const cockAttack = new BN(cockStats.attack);
              const cockAttackSpeed = new BN(cockStats.attackSpeed);
              const cockCritChance = new BN(cockStats.critChance);
              const cockHealth = new BN(cockStats.health);
              const cockEvasion = new BN(cockStats.evasion);
              const cockTotalStats = cockAttack
                .add(cockAttackSpeed)
                .add(cockCritChance)
                .add(cockHealth)
                .add(cockEvasion);

              assert.equal(
                cockTotalStats.toNumber(),
                10 + +event.args.point.toNumber()
              );

              assert.equal(attack.toNumber(), cockAttack.toNumber());
              assert.equal(attackSpeed.toNumber(), cockAttackSpeed.toNumber());
              assert.equal(critChance.toNumber(), cockCritChance.toNumber());
              assert.equal(health.toNumber(), cockHealth.toNumber());
              assert.equal(evasion.toNumber(), cockEvasion.toNumber());
            }
          }
        } else {
          console.log("암병아리 나와서 실패...");
        }
      });
      it("게임 입장 제어", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 게임 입장
        await cockFightInstance.manageCockEntry(tokenId, 2, {
          from: deployer,
        });

        const info = await cockInstance.game(tokenId);

        assert.equal(info.status.toNumber(), 2);

        // 게임 입장 시 전송 불가
        await expectRevert(
          cockInstance.safeTransferFrom(user, user2, tokenId),
          "revert"
        );
      });
      it("게임 입장 시 전송불가 -> 게임 퇴장시만 전송 가능", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 0 -> live
        // 1 -> dead
        // 2 -> game enter

        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        {
          // 죽는 경우 지원 안함 cockGameUpdate를 사용해야함
          await expectRevert(
            cockFightInstance.manageCockEntry(tokenId, 1, {
              from: deployer,
            }),
            "1 is not supported"
          );
        }

        {
          // 전투중이지 않으면 게임 빼기
          await cockFightInstance.manageCockEntry(tokenId, 0, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 0);

          // 게임 퇴장 시 전송 가능
          await cockInstance.safeTransferFrom(user, user2, tokenId, {
            from: user,
          });

          assert.equal(await cockInstance.ownerOf(tokenId), user2);
        }
      });
      it("승/패 정보 업데이트", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        {
          // 승/패 정보 업데이트
          await cockFightInstance.cockGameUpdate(tokenId, 0, 1, 0, 0, {
            from: deployer,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 0);
          assert.equal(gameInfo.win.toNumber(), 1);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
        }
      });
      it("승/패 게임 참여중 토너먼트 점수 업데이트하기 / 살아있는 상태중 토너먼트 점수 업데이트하기", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        // 게임 진행 중인 상태에서 토너먼트 점수 업데이트하기
        {
          // 승/패 정보 업데이트
          await cockFightInstance.cockGameUpdate(tokenId, 2, 1, 0, 0, {
            from: deployer,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 2);
          assert.equal(gameInfo.win.toNumber(), 1);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
        }

        // 게임 퇴장
        await cockFightInstance.manageCockEntry(tokenId, 0, {
          from: deployer,
        });

        // 대기 중인 상태에서 토너먼트 점수 업데이트하기
        {
          // 업데이트
          await cockFightInstance.cockGameUpdate(tokenId, 0, 0, 0, 1, {
            from: deployer,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 0);
          assert.equal(gameInfo.win.toNumber(), 1);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 1);
        }
      });
      it("죽었을 경우 부활아이템 사서 사용", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        {
          // 닭 사망 처리
          await cockFightInstance.cockGameUpdate(tokenId, 1, 0, 0, 0, {
            from: deployer,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
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

        // 아이템 사기
        await cockFightInstance.cockItemBuy(1, 1, {
          from: user,
        });

        // chick item 보유량
        const balance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(1));

        // 1155 approve
        await cockItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        const cockJson = {
          CockContract: cockInstance.address,
          CockTokenId: tokenId,
          cockItemContract: cockItemInstance.address,
          cockItemTokenId: 1,
          cockItemAmount: 1,
        };
        // 부활
        await cockFightInstance.cockUseLifeItem(cockJson, {
          from: user,
        });

        const afterBalance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        // 아이템 burn 확인
        assert.equal(afterBalance, new BN(0).toString());

        {
          // 부활 확인
          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 0);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
        }
      });
      it("죽었을 경우 부활아이템 사용하면 전적 초기화", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        {
          // 닭 사망 처리 및 승 1 업데이트
          await cockFightInstance.cockGameUpdate(tokenId, 1, 1, 0, 0, {
            from: deployer,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 1);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
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

        // 아이템 사기
        await cockFightInstance.cockItemBuy(1, 1, {
          from: user,
        });

        // chick item 보유량
        const balance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(1));

        // 1155 approve
        await cockItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        const cockJson = {
          CockContract: cockInstance.address,
          CockTokenId: tokenId,
          cockItemContract: cockItemInstance.address,
          cockItemTokenId: 1,
          cockItemAmount: 1,
        };
        // 부활
        await cockFightInstance.cockUseLifeItem(cockJson, {
          from: user,
        });

        const afterBalance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        // 아이템 burn 확인
        assert.equal(afterBalance, new BN(0).toString());

        {
          // 부활 확인 및 승수 초기화
          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 0);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
        }
      });
      it("어드민에 등록 후 지갑으로 게임 입장 제어 잘되는지", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 관리자 지갑 control 등록
        await cfnAccessControlInstance.addWhiteListControl(other, {
          from: deployer,
        });

        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: other,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        {
          // 전투중이지 않으면 게임 빼기
          await cockFightInstance.manageCockEntry(tokenId, 0, {
            from: other,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 0);
        }
      });
      it("어드민에 등록 후 매칭 정보 업데이트 제어 잘되는지", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 관리자 지갑 control 등록
        await cfnAccessControlInstance.addWhiteListControl(other, {
          from: deployer,
        });

        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: other,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        {
          // 승/패 정보 업데이트
          await cockFightInstance.cockGameUpdate(tokenId, 0, 1, 0, 0, {
            from: other,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 0);
          assert.equal(gameInfo.win.toNumber(), 1);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
        }
      });
    });

    describe("######### 쿡파이트 수닭 에러테스트 #########", async () => {
      it("게임 입장 제어 시 죽음으로 제어할 시 에러", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 게임 입장(죽음상태로 제어)
        await expectRevert(
          cockFightInstance.manageCockEntry(tokenId, 1, {
            from: deployer,
          }),
          "revert 1 is not supported"
        );

        const info = await cockInstance.game(tokenId);
        //  상태가 안 변했으니 0 상태
        assert.equal(info.status.toNumber(), 0);
      });
      it("살았을 경우 부활아이템 사서 사용 에러", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
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

        // 아이템 사기
        await cockFightInstance.cockItemBuy(1, 1, {
          from: user,
        });

        // chick item 보유량
        const balance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(1));

        // 1155 approve
        await cockItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        const cockJson = {
          CockContract: cockInstance.address,
          CockTokenId: tokenId,
          cockItemContract: cockItemInstance.address,
          cockItemTokenId: 1,
          cockItemAmount: 1,
        };
        // 부활 시 살아있으니 에러
        await expectRevert(
          cockFightInstance.cockUseLifeItem(cockJson, {
            from: user,
          }),
          "revert Cock is not dead"
        );

        const afterBalance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        // 아이템 burn 안된거 확인
        assert.equal(afterBalance, new BN(1).toString());
      });
      it("유저가 게임 입장 제어 시 에러", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 게임 입장
        await expectRevert(
          cockFightInstance.manageCockEntry(tokenId, 2, {
            from: user,
          }),
          "revert Unverified owner address"
        );

        const info = await cockInstance.game(tokenId);

        assert.equal(info.status.toNumber(), 0);
      });
      it("게임 입장 중이거나 죽은 닭인 경우 전송 막힘", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        // 0 -> live
        // 1 -> dead
        // 2 -> game enter

        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        {
          // 닭 사망
          await cockFightInstance.cockGameUpdate(tokenId, 1, 0, 1, 0, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 1);

          // 닭 사망시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }
      });
      it("승/패 정보를 한번에 2 이상 업데이트 시 에러", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        {
          // 승/패 정보 업데이트
          await expectRevert(
            cockFightInstance.cockGameUpdate(tokenId, 0, 2, 0, 0, {
              from: deployer,
            }),
            "revert Must be less than 2"
          );

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 2);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
        }

        {
          // 승/패 정보 업데이트
          await expectRevert(
            cockFightInstance.cockGameUpdate(tokenId, 0, 0, 2, 0, {
              from: deployer,
            }),
            "revert Must be less than 2"
          );

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 2);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
        }
      });
      it("닭이 죽어있는 경우 승/패 업데이트 시 에러", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }
        {
          // 게임 입장
          await cockFightInstance.manageCockEntry(tokenId, 2, {
            from: deployer,
          });

          const info = await cockInstance.game(tokenId);

          assert.equal(info.status.toNumber(), 2);

          // 게임 입장 시 전송 불가
          await expectRevert(
            cockInstance.safeTransferFrom(user, user2, tokenId, {
              from: user,
            }),
            "revert"
          );
        }

        {
          // 닭 사망 시키기
          await cockFightInstance.cockGameUpdate(tokenId, 1, 0, 1, 0, {
            from: deployer,
          });
          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 1);
          assert.equal(gameInfo.draw.toNumber(), 0);
        }

        {
          // 죽은 경우 닭 정보 업데이트 에러
          await expectRevert(
            cockFightInstance.cockGameUpdate(tokenId, 0, 0, 1, 0, {
              from: deployer,
            }),
            "revert Already dead!"
          );

          // 죽은 경우 닭 정보 업데이트 에러
          await expectRevert(
            cockFightInstance.cockGameUpdate(tokenId, 1, 0, 1, 0, {
              from: deployer,
            }),
            "revert Already dead!"
          );

          // 죽은 경우 닭 정보 업데이트 에러
          await expectRevert(
            cockFightInstance.cockGameUpdate(tokenId, 2, 0, 1, 0, {
              from: deployer,
            }),
            "revert Already dead!"
          );

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 1);
          assert.equal(gameInfo.draw.toNumber(), 0);
        }
      });
      it("부활 아이템 approve 안했을 경우 에러", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        {
          // 닭 사망 처리
          await cockFightInstance.cockGameUpdate(tokenId, 1, 0, 0, 0, {
            from: deployer,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
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

        // 아이템 사기
        await cockFightInstance.cockItemBuy(1, 1, {
          from: user,
        });

        // chick item 보유량
        const balance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(1));

        const cockJson = {
          CockContract: cockInstance.address,
          CockTokenId: tokenId,
          cockItemContract: cockItemInstance.address,
          cockItemTokenId: 1,
          cockItemAmount: 1,
        };
        // 부활
        await expectRevert(
          cockFightInstance.cockUseLifeItem(cockJson, {
            from: user,
          }),
          "revert ERC1155: caller is not owner nor approved"
        );

        const afterBalance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        // 아이템 burn 안된거 확인
        assert.equal(afterBalance, new BN(1).toString());

        {
          // 부활 안된거 확인
          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
        }
      });
      it("부활 아이템 2개 이상 쓸 경우 에러", async () => {
        const tokenId = await hatchGrowCock(user, 1);

        if (!tokenId) {
          console.log("암병아리 입니다... 테스트 실패");
          return;
        }

        {
          // 닭 사망 처리
          await cockFightInstance.cockGameUpdate(tokenId, 1, 0, 0, 0, {
            from: deployer,
          });

          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
          assert.equal(gameInfo.draw.toNumber(), 0);
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

        // 아이템 사기
        await cockFightInstance.cockItemBuy(1, 2, {
          from: user,
        });

        // chick item 보유량
        const balance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        assert.equal(balance, new BN(2));

        // 1155 approve
        await cockItemInstance.setApprovalForAll(
          cockFightInstance.address,
          true,
          {
            from: user,
          }
        );

        const cockJson = {
          CockContract: cockInstance.address,
          CockTokenId: tokenId,
          cockItemContract: cockItemInstance.address,
          cockItemTokenId: 1,
          cockItemAmount: 2,
        };
        // 부활
        await expectRevert(
          cockFightInstance.cockUseLifeItem(cockJson, {
            from: user,
          }),
          "revert"
        );

        const afterBalance = (
          await cockItemInstance.balanceOf(user, new BN(1))
        ).toString();

        // 아이템 burn 안된거 확인
        assert.equal(afterBalance, new BN(2).toString());

        {
          // 부활 안된거
          const gameInfo = await cockInstance.game(tokenId);

          assert.equal(gameInfo.status.toNumber(), 1);
          assert.equal(gameInfo.win.toNumber(), 0);
          assert.equal(gameInfo.lose.toNumber(), 0);
        }
      });
    });
  }
);
