const Cfn = artifacts.require("CFN");
const Egg = artifacts.require("Egg");
const ProtocolEggExecutionManager = artifacts.require(
  "ProtocolEggExecutionManger"
);

const {
  expectRevert,
  time,
  BN,
  expectEvent,
} = require("@openzeppelin/test-helpers");

contract(
  "-------------------- 1_egg_sample.test.js 알 민팅 케이스 ---------------------------",
  (accounts) => {
    const [deployer, user, partner, receiveWallet, other] = accounts;

    let eggInstance;
    let tokenInstance;
    let protocolEggManagerInstance;

    // 초기 세팅
    beforeEach(async () => {
      // deploy cfn token contract
      tokenInstance = await Cfn.new({ from: deployer });

      // deploy egg contract
      eggInstance = await Egg.new({ from: deployer });

      // deploy protocolEggExecution contract
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

      // 1000개씩 토큰 전송
      await tokenInstance.transfer(user, web3.utils.toWei("1000", "ether"), {
        from: deployer,
      });
      await tokenInstance.transfer(partner, web3.utils.toWei("1000", "ether"), {
        from: deployer,
      });
    });

    describe("######### 민팅 성공 케이스 #########", () => {
      it("알 민팅", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          eggPrice,
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
      });
      it("egg batch 민팅", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        const numberOfTokens = 5;
        const totalCost = eggPrice.mul(new BN(numberOfTokens));
        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          totalCost,
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
      });
    });

    // error case
    describe("######### 민팅 에러 케이스 #########", () => {
      it("직접 컨트랙트에서 접근해서 민팅할경우 에러", async () => {
        await expectRevert(eggInstance.mint(user, { from: user }), "revert");
      });

      it("판매중이지 않을때는 민팅 X", async () => {
        // sale 변경
        await eggInstance.setSaleIsActive(false, { from: deployer });

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          eggPrice,
          {
            from: user,
          }
        );

        // 에러
        await expectRevert(
          protocolEggManagerInstance.singleMint({ from: user }),
          "Sale must be active."
        );
      });

      it("토큰 approve X일시 에러", async () => {
        await expectRevert(
          protocolEggManagerInstance.singleMint({ from: user }),
          "revert ERC20: insufficient allowance"
        );
      });

      it("토큰 approve 부족하게 할 시에도 에러", async () => {
        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          web3.utils.toWei("10", "ether"),
          {
            from: user,
          }
        );

        // 에러
        await expectRevert(
          protocolEggManagerInstance.singleMint({ from: user }),
          "revert ERC20: insufficient allowance"
        );
      });

      it("토큰은 없는데 민팅 할시 에러", async () => {
        // 에러
        await expectRevert(
          protocolEggManagerInstance.singleMint({ from: other }),
          "revert ERC20: insufficient allowance"
        );
      });

      it("토큰은 approve는 충족하나 토큰이 없는데 민팅 할시 에러", async () => {
        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          eggPrice,
          {
            from: other,
          }
        );

        // 에러
        await expectRevert(
          protocolEggManagerInstance.singleMint({ from: other }),
          "revert ERC20: transfer amount exceeds balance"
        );
      });

      it("블랙리스트에 추가된 사용자는 민팅은 가능하나 전송 불가", async () => {
        // 블랙리스트 추가
        await eggInstance.addAddressToBlacklist(user, { from: deployer });

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          eggPrice,
          { from: user }
        );

        // 민팅
        await protocolEggManagerInstance.singleMint({ from: user });

        const tokenId = new BN(1);

        // 블랙리스트에 추가된 유저가 토큰을 전송하려고 할 때 에러가 발생하는지 확인
        await expectRevert(
          eggInstance.transferFrom(user, partner, tokenId, { from: user }),
          "Caller is blacklisted."
        );

        await expectRevert(
          eggInstance.safeTransferFrom(user, partner, tokenId, { from: user }),
          "Caller is blacklisted."
        );
      });

      it("블랙리스트에서 제거된 사용자는 전송 가능", async () => {
        // 블랙리스트 추가
        await eggInstance.addAddressToBlacklist(user, { from: deployer });

        // 알 가격
        const eggPrice = await protocolEggManagerInstance.getEggPrice();

        // 토큰 approve
        await tokenInstance.approve(
          protocolEggManagerInstance.address,
          eggPrice,
          { from: user }
        );

        // 민팅
        await protocolEggManagerInstance.singleMint({ from: user });

        const tokenId = new BN(1);

        // 블랙리스트에 추가된 유저가 토큰을 전송하려고 할 때 에러가 발생하는지 확인
        await expectRevert(
          eggInstance.transferFrom(user, partner, tokenId, { from: user }),
          "Caller is blacklisted."
        );

        await expectRevert(
          eggInstance.safeTransferFrom(user, partner, tokenId, { from: user }),
          "Caller is blacklisted."
        );

        // 블랙리스트 제거
        await eggInstance.removeAddressFromBlacklist(user, { from: deployer });

        await eggInstance.transferFrom(user, partner, tokenId, { from: user });

        // owner 확인
        assert.equal(await eggInstance.ownerOf(tokenId), partner);
      });
    });
  }
);
