// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "./interfaces/ICFNAccessControl.sol";
import "./interfaces/IEgg.sol";
import "./interfaces/IEggItem.sol";
import "./libraries/ItemTypes.sol";
import "./interfaces/ICockerelChick.sol";
import "./interfaces/IPulletChick.sol";
import "./interfaces/IChickItem.sol";
import "./interfaces/ICock.sol";
import "./interfaces/IHen.sol";
import "./interfaces/ICockItem.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CockFight is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ItemTypes for ItemTypes.EggConsumeItem;
    using ItemTypes for ItemTypes.EggItem;
    using ItemTypes for ItemTypes.ChickItem;
    using ItemTypes for ItemTypes.ChickConsumeItem;

    constructor(
        address _accessControl,
        address _receiveWallet,
        address _eggContract,
        address _erc20Contract,
        address _eggItemContract,
        address _cockerelChickContract,
        address _pulletChickContract,
        address _chickItemContract,
        address _cockContract,
        address _henContract,
        address _cockItemContract
    ) {
        require(
            _accessControl != address(0) &&
                _receiveWallet != address(0) &&
                _eggContract != address(0) &&
                _erc20Contract != address(0) &&
                _cockerelChickContract != address(0) &&
                _pulletChickContract != address(0) &&
                _chickItemContract != address(0) &&
                _cockContract != address(0) &&
                _henContract != address(0) &&
                _cockItemContract != address(0),
            "Cannot be null address."
        );

        accessControlManager = ICFNAccessControl(_accessControl);
        receiveWallet = payable(_receiveWallet);
        eggManager = IEgg(_eggContract);
        tokenManager = IERC20(_erc20Contract);
        eggItemManager = IEggItem(_eggItemContract);
        cockerelChickManager = ICockerelChick(_cockerelChickContract);
        pulletChickManager = IPulletChick(_pulletChickContract);
        chickItemManager = IChickItem(_chickItemContract);
        cockManager = ICock(_cockContract);
        henManager = IHen(_henContract);
        cockItemManager = ICockItem(_cockItemContract);
    }

    // ----------------------- access section -----------------------
    modifier isBlackListWallet(address _address) {
        require(
            !accessControlManager.blackListWallet(_address),
            "Transaction denied: address is blacklisted"
        );
        _;
    }

    modifier isWhiteListControl(address _ca) {
        require(
            accessControlManager.whiteListControlAddress(_ca),
            "Unverified owner address"
        );
        _;
    }

    // ----------------------- contract / manager section -----------------------
    address deadAddress = 0x000000000000000000000000000000000000dEaD;

    string public name = "Cockfight Network Echo System";
    string public symbol = "Cockfight";
    string private _secret_word = "CFNToken";

    uint256 public Male = 995; // 99.5%
    uint256 public FeMale = 5; // 0.5%

    uint256 public chickMaleCount = 0;
    uint256 public chickFemaleCount = 0;

    ICFNAccessControl public accessControlManager; // owner list contract
    address payable public receiveWallet; // cfn or gmmt withdraw address
    IEgg public eggManager; // erc721 egg contract
    IERC20 public tokenManager; // cfn token
    IEggItem public eggItemManager; // erc1155 egg item contract
    ICockerelChick public cockerelChickManager; // erc721 cockerel chick contract
    IPulletChick public pulletChickManager; // erc721 pullet chick contract
    IChickItem public chickItemManager; // erc1155 chick item contract
    ICock public cockManager; // cock contract
    IHen public henManager; // hen contract
    ICockItem public cockItemManager; // erc1155 cock item contract

    event NewSecretWord(string word);
    event NewSex(uint256 Male, uint256 FeMale);
    event NewAccessControlManager(address indexed accessContract);
    event NewReceiveWallet(address indexed wallet);
    event NewEggManager(address indexed eggContract);
    event NewTokenManager(address indexed tokenContract);
    event NewEggItemManager(address indexed eggItemContract);
    event NewCockerelChickManager(address indexed cockerelChickContract);
    event NewPulletChickManager(address indexed pulletChickContract);
    event NewChickItemManager(address indexed chickItemContract);
    event NewCockManager(address indexed cockContract);
    event NewHenManager(address indexed henContract);
    event NewCockItemManager(address indexed cockItemContract);

    function updateSecretWord(
        string memory _newSecret
    ) public isWhiteListControl(msg.sender) {
        _secret_word = _newSecret;

        emit NewSecretWord(_newSecret);
    }

    function updateFeMale(
        uint256 _female
    ) public isWhiteListControl(msg.sender) {
        require(_female < 1001, "Must be less than 1001");

        FeMale = _female;
        Male = 1000 - _female;

        emit NewSex(Male, _female);
    }

    function updateAccessControlManager(
        address _accessControlContract
    ) public isWhiteListControl(msg.sender) {
        accessControlManager = ICFNAccessControl(_accessControlContract);

        emit NewAccessControlManager(_accessControlContract);
    }

    function updateReceiveWallet(
        address _receiveWallet
    ) public isWhiteListControl(msg.sender) {
        receiveWallet = payable(_receiveWallet);

        emit NewReceiveWallet(_receiveWallet);
    }

    function updateEggManager(
        address _eggContract
    ) public isWhiteListControl(msg.sender) {
        eggManager = IEgg(_eggContract);

        emit NewEggManager(_eggContract);
    }

    function updateTokenManager(
        address _tokenContract
    ) public isWhiteListControl(msg.sender) {
        tokenManager = IERC20(_tokenContract);

        emit NewTokenManager(_tokenContract);
    }

    function updateEggItemManager(
        address _eggItemContract
    ) public isWhiteListControl(msg.sender) {
        eggItemManager = IEggItem(_eggItemContract);

        emit NewEggItemManager(_eggItemContract);
    }

    function updateCockerelChickManager(
        address _cockerelChickContract
    ) public isWhiteListControl(msg.sender) {
        cockerelChickManager = ICockerelChick(_cockerelChickContract);

        emit NewCockerelChickManager(_cockerelChickContract);
    }

    function updatePulletChickManager(
        address _pulletChickContract
    ) public isWhiteListControl(msg.sender) {
        pulletChickManager = IPulletChick(_pulletChickContract);

        emit NewPulletChickManager(_pulletChickContract);
    }

    function updateChickItemManager(
        address _chickItemContract
    ) public isWhiteListControl(msg.sender) {
        chickItemManager = IChickItem(_chickItemContract);

        emit NewChickItemManager(_chickItemContract);
    }

    function updateCockManager(
        address _cockContract
    ) public isWhiteListControl(msg.sender) {
        cockManager = ICock(_cockContract);

        emit NewCockManager(_cockContract);
    }

    function updateHenManager(
        address _henContract
    ) public isWhiteListControl(msg.sender) {
        henManager = IHen(_henContract);

        emit NewHenManager(_henContract);
    }

    function updateCockItemManager(
        address _cockItemContract
    ) public isWhiteListControl(msg.sender) {
        cockItemManager = ICockItem(_cockItemContract);

        emit NewCockItemManager(_cockItemContract);
    }

    // commit reveal scheme
    function getCommitHash(
        string memory _secret,
        string memory _nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_secret, _nonce));
    }

    enum Gender {
        Boy,
        Girl
    }

    // egg random gender
    function _generate_gender(uint256 _tokenId) private view returns (Gender) {
        uint256 randomValue = uint256(
            keccak256(
                abi.encodePacked(
                    _secret_word,
                    _tokenId,
                    msg.sender,
                    block.timestamp
                )
            )
        );

        uint256 scaledValue = randomValue % 1000;

        if (scaledValue < FeMale) {
            return Gender.Girl;
        } else {
            return Gender.Boy;
        }
    }

    // ----------------------- deposit section -----------------------
    event Withdraw(address indexed walletAddress, uint256 withdrawAmount);
    event WithdrawToken(
        address indexed walletAddress,
        uint256 withdrawAmount,
        address tokenContract
    );

    // 토큰 전체 출금
    function withdrawTokenAll() public isWhiteListControl(msg.sender) {
        require(receiveWallet != address(0), "Cannot be null address");

        uint256 tokenAmount = tokenManager.balanceOf(address(this));
        require(tokenAmount > 0, "Amount must be greater than 0");
        require(tokenAmount > 0, "Not enough token balance.");

        tokenManager.transfer(receiveWallet, tokenAmount);

        emit WithdrawToken(receiveWallet, tokenAmount, address(tokenManager));
    }

    // 토큰 원하는 수량 출금
    function withdrawToken(
        uint256 _amount
    ) public isWhiteListControl(msg.sender) {
        require(receiveWallet != address(0), "Cannot be null address");
        require(_amount > 0, "Amount must be greater than 0");

        uint256 tokenAmount = tokenManager.balanceOf(address(this));

        require(tokenAmount >= _amount, "Not enough token balance.");

        tokenManager.transfer(receiveWallet, _amount);

        emit WithdrawToken(receiveWallet, _amount, address(tokenManager));
    }

    // 코인 전체 출금
    function withdrawCoinAll() public payable isWhiteListControl(msg.sender) {
        require(receiveWallet != address(0), "Cannot be null address");

        uint256 balance = address(this).balance;
        require(balance > 0, "Not enough coin balance.");

        (bool success, ) = receiveWallet.call{value: balance}("");
        require(success, "Transfer failed.");

        emit Withdraw(receiveWallet, balance);
    }

    // 코인 원하는 수량 출금
    function withdrawCoin(
        uint256 _amount
    ) public payable isWhiteListControl(msg.sender) {
        require(receiveWallet != address(0), "Cannot be null address");
        require(_amount > 0, "Amount must be greater than 0");

        uint256 balance = address(this).balance;
        require(balance >= _amount, "Not enough coin balance.");

        (bool success, ) = receiveWallet.call{value: _amount}("");
        require(success, "Transfer failed.");

        emit Withdraw(receiveWallet, _amount);
    }

    // ----------------------- egg section -----------------------

    // ############ egg hatch calculate ############
    // 알 부화 시간 계산기
    function getEggHatchCalculate(
        uint256 _tokenId
    )
        public
        view
        returns (
            uint256 currentTimestamp,
            uint256 timestamp3Weeks,
            uint256 timestampRemaining
        )
    {
        IEgg.EggHatchStruct memory egg = eggManager.hatch(_tokenId);

        uint256 _timestamp = uint256(block.timestamp);

        currentTimestamp = egg.currentTimestamp;
        timestamp3Weeks = egg.timestamp3Weeks;

        if (egg.timestamp3Weeks >= _timestamp) {
            timestampRemaining = egg.timestamp3Weeks - _timestamp;
        } else {
            timestampRemaining = 0;
        }
    }

    // ############ egg use item ############
    error ConsumeManagerError(address eggContract, address eggItemContract);
    error ConsumeOwnerError(address wallet);
    error ConsumeItemNotEnoughError(address wallet, uint256 itemTokenId);
    error ConsumeDayZeroError();
    error ConsumeTimeShrinkError();
    error ConsumeItemExpired();

    event EggConsumeItem(
        address eggContract,
        uint256 eggTokenId,
        address eggItemContract,
        uint256 eggItemTokenId,
        uint256 eggItemAmount,
        uint256 datesToSubtract
    );

    // 알 아이템 사용
    // start require 1155 approveAll to cockFight.sol
    function eggConsumeItem(
        ItemTypes.EggConsumeItem calldata consume
    ) public nonReentrant {
        // check
        if (
            eggManager != IEgg(consume.eggContract) &&
            eggItemManager != IEggItem(consume.eggItemContract)
        ) {
            revert ConsumeManagerError(
                consume.eggContract,
                consume.eggItemContract
            );
        }
        if (eggManager.ownerOf(consume.eggTokenId) != msg.sender) {
            revert ConsumeOwnerError(msg.sender);
        }
        if (
            eggItemManager.balanceOf(msg.sender, consume.eggItemTokenId) <
            consume.eggItemAmount
        ) {
            revert ConsumeItemNotEnoughError(
                msg.sender,
                consume.eggItemTokenId
            );
        }

        // get data
        ItemTypes.EggItem memory eggItem = eggItemManager.tokenURIs(
            consume.eggItemTokenId
        );
        IEgg.EggHatchStruct memory egg = eggManager.hatch(consume.eggTokenId);

        if (egg.timestamp3Weeks <= block.timestamp) {
            revert ConsumeItemExpired();
        }

        // check
        if (egg.timestamp3Weeks <= egg.currentTimestamp) {
            revert ConsumeTimeShrinkError();
        }

        // day item
        // check
        if (eggItem.day == 0) {
            revert ConsumeDayZeroError();
        }

        // 1155 burn
        eggItemManager.burn(
            msg.sender,
            consume.eggItemTokenId,
            consume.eggItemAmount
        );

        // get datesToSubtract
        uint256 duration = egg.timestamp3Weeks - egg.currentTimestamp;
        uint256 datesToSubtract;
        if (duration >= eggItem.day * consume.eggItemAmount) {
            datesToSubtract = eggItem.day * consume.eggItemAmount;
        } else {
            datesToSubtract = duration;
        }

        // using item
        bool success = eggManager.usingItem(
            consume.eggTokenId,
            msg.sender,
            datesToSubtract
        );

        // event
        if (success) {
            emit EggConsumeItem(
                consume.eggContract,
                consume.eggTokenId,
                consume.eggItemContract,
                consume.eggItemTokenId,
                consume.eggItemAmount,
                datesToSubtract
            );
        }
    }

    // ############ egg hatch ############
    error EggHatchManagerError(address eggContract);
    error EggHatchOwnerError(address wallet);
    error EggHatchUnsatisfactoryTime(uint256 eggTimestamp);

    event EggHatchResult(
        address owner,
        address eggContract,
        uint256 tokenId,
        address chickContract
    );

    // 알 부화
    // start require 721 approveAll to cockFight.sol
    function eggHatch(
        address eggContract,
        uint256 tokenId
    ) public isBlackListWallet(msg.sender) nonReentrant {
        // check
        if (eggManager != IEgg(eggContract)) {
            revert EggHatchManagerError(eggContract);
        }
        if (eggManager.ownerOf(tokenId) != msg.sender) {
            revert EggHatchOwnerError(msg.sender);
        }

        IEgg.EggHatchStruct memory egg = eggManager.hatch(tokenId);

        // check
        if (egg.timestamp3Weeks > block.timestamp) {
            revert EggHatchUnsatisfactoryTime(egg.timestamp3Weeks);
        }

        // burn
        eggManager.safeTransferFrom(msg.sender, deadAddress, tokenId);

        Gender result = _generate_gender(tokenId);

        if (result == Gender.Girl) {
            pulletChickManager.mint(msg.sender);

            chickFemaleCount++;

            emit EggHatchResult(
                msg.sender,
                address(eggManager),
                tokenId,
                address(pulletChickManager)
            );
        } else {
            cockerelChickManager.mint(msg.sender);

            chickMaleCount++;

            emit EggHatchResult(
                msg.sender,
                address(eggManager),
                tokenId,
                address(cockerelChickManager)
            );
        }
    }

    // ----------------------- chick section -----------------------
    // ############ cockerel chick hatch calculate ############
    // 수병아리 성장 시간 계산기
    function getCockerelChickCalculate(
        uint256 _tokenId
    )
        public
        view
        returns (
            uint256 currentTimestamp,
            uint256 timestamp30Days,
            uint256 timestampRemaining
        )
    {
        ICockerelChick.ChickGrowStruct memory chick = cockerelChickManager.grow(
            _tokenId
        );

        uint256 _timestamp = uint256(block.timestamp);

        currentTimestamp = chick.currentTimestamp;
        timestamp30Days = chick.timestamp30Days;

        if (chick.timestamp30Days >= _timestamp) {
            timestampRemaining = chick.timestamp30Days - _timestamp;
        } else {
            timestampRemaining = 0;
        }
    }

    // ############ pullet chick hatch calculate ############
    // 암병아리 성장 시간 계산기
    function getPulletChickCalculate(
        uint256 _tokenId
    )
        public
        view
        returns (
            uint256 currentTimestamp,
            uint256 timestamp30Days,
            uint256 timestampRemaining
        )
    {
        IPulletChick.ChickGrowStruct memory chick = pulletChickManager.grow(
            _tokenId
        );

        uint256 _timestamp = uint256(block.timestamp);

        currentTimestamp = chick.currentTimestamp;
        timestamp30Days = chick.timestamp30Days;

        if (chick.timestamp30Days >= _timestamp) {
            timestampRemaining = chick.timestamp30Days - _timestamp;
        } else {
            timestampRemaining = 0;
        }
    }

    // ############ chick use item ############
    error ChickAlreadyUpgradeError(address chick, uint256 tokenId);
    error ChickItemExpired();
    error ChickApproveError();

    event ChickConsumeItem(
        address chickContract,
        uint256 chickTokenId,
        address itemContract,
        uint256 itemTokenId,
        uint256 itemAmount,
        uint256 datesToSubtract
    );

    event ChickConsumeItemStats(
        address chickContract,
        uint256 chickTokenId,
        address itemContract,
        uint256 itemTokenId,
        uint256 itemAmount,
        uint256 point,
        bool isDead
    );

    // 병아리 아이템 사용
    // start require 1155 approveAll to cockFight.sol
    function chickConsumeItem(
        ItemTypes.ChickConsumeItem calldata consume
    ) public nonReentrant {
        // cockerel / pullet
        if (consume.CockerelChickContract != address(0)) {
            // cockerel chick item
            if (
                cockerelChickManager !=
                ICockerelChick(consume.CockerelChickContract) &&
                chickItemManager != IChickItem(consume.chickItemContract)
            ) {
                revert ConsumeManagerError(
                    consume.CockerelChickContract,
                    consume.chickItemContract
                );
            }

            if (
                cockerelChickManager.ownerOf(consume.CockerelChickTokenId) !=
                msg.sender
            ) {
                revert ConsumeOwnerError(msg.sender);
            }

            if (
                chickItemManager.balanceOf(
                    msg.sender,
                    consume.chickItemTokenId
                ) < consume.chickItemAmount
            ) {
                revert ConsumeItemNotEnoughError(
                    msg.sender,
                    consume.chickItemTokenId
                );
            }

            ItemTypes.ChickItem memory chickItem = chickItemManager.tokenURIs(
                consume.chickItemTokenId
            );
            ICockerelChick.ChickGrowStruct
                memory cockerelGrow = cockerelChickManager.grow(
                    consume.CockerelChickTokenId
                );
            uint256 upgradeCounts = cockerelChickManager.upgradeCounts(
                consume.CockerelChickTokenId
            );

            if (cockerelGrow.timestamp30Days <= block.timestamp) {
                revert ChickItemExpired();
            }

            if (chickItem.day != 0) // grow / stats
            {
                // usingGrowItem
                if (
                    cockerelGrow.timestamp30Days <=
                    cockerelGrow.currentTimestamp
                ) {
                    revert ConsumeTimeShrinkError();
                }

                // 1155 burn
                chickItemManager.burn(
                    msg.sender,
                    consume.chickItemTokenId,
                    consume.chickItemAmount
                );

                uint256 duration = cockerelGrow.timestamp30Days -
                    cockerelGrow.currentTimestamp;
                uint256 datesToSubtract;
                if (duration >= chickItem.day * consume.chickItemAmount) {
                    datesToSubtract = chickItem.day * consume.chickItemAmount;
                } else {
                    datesToSubtract = duration;
                }

                bool success = cockerelChickManager.usingGrowItem(
                    consume.CockerelChickTokenId,
                    msg.sender,
                    datesToSubtract
                );

                if (success) {
                    emit ChickConsumeItem(
                        consume.CockerelChickContract,
                        consume.CockerelChickTokenId,
                        consume.chickItemContract,
                        consume.chickItemTokenId,
                        consume.chickItemAmount,
                        datesToSubtract
                    );
                }
            } else {
                if (
                    !cockerelChickManager.isApprovedForAll(
                        msg.sender,
                        address(this)
                    )
                ) {
                    revert ChickApproveError();
                }

                if (consume.chickItemAmount != 1) {
                    revert ConsumeItemNotEnoughError(
                        msg.sender,
                        consume.CockerelChickTokenId
                    );
                }

                // usingStatUpgrade
                if (upgradeCounts <= 0) {
                    revert ChickAlreadyUpgradeError(
                        consume.CockerelChickContract,
                        consume.CockerelChickTokenId
                    );
                }

                // 1155 burn
                chickItemManager.burn(
                    msg.sender,
                    consume.chickItemTokenId,
                    consume.chickItemAmount
                );

                (uint256 _point, bool _isDead) = cockerelChickManager
                    .usingStatUpgrade(
                        consume.CockerelChickTokenId,
                        msg.sender,
                        chickItem.statsIndex
                    );

                emit ChickConsumeItemStats(
                    consume.CockerelChickContract,
                    consume.CockerelChickTokenId,
                    consume.chickItemContract,
                    consume.chickItemTokenId,
                    consume.chickItemAmount,
                    _point,
                    _isDead
                );
            }
        } else {
            if (
                consume.PulletChickContract == address(0) &&
                pulletChickManager != IPulletChick(consume.PulletChickContract)
            ) {
                revert ConsumeManagerError(
                    consume.PulletChickContract,
                    consume.chickItemContract
                );
            }

            if (
                pulletChickManager.ownerOf(consume.PulletChickTokenId) !=
                msg.sender
            ) {
                revert ConsumeOwnerError(msg.sender);
            }

            if (
                chickItemManager.balanceOf(
                    msg.sender,
                    consume.chickItemTokenId
                ) < consume.chickItemAmount
            ) {
                revert ConsumeItemNotEnoughError(
                    msg.sender,
                    consume.chickItemTokenId
                );
            }

            ItemTypes.ChickItem memory chickItem = chickItemManager.tokenURIs(
                consume.chickItemTokenId
            );

            IPulletChick.ChickGrowStruct memory pulletGrow = pulletChickManager
                .grow(consume.PulletChickTokenId);

            if (pulletGrow.timestamp30Days <= pulletGrow.currentTimestamp) {
                revert ConsumeTimeShrinkError();
            }

            require(chickItem.isPulletPossible, "No items");

            // 1155 burn
            chickItemManager.burn(
                msg.sender,
                consume.chickItemTokenId,
                consume.chickItemAmount
            );

            uint256 duration = pulletGrow.timestamp30Days -
                pulletGrow.currentTimestamp;
            uint256 datesToSubtract;
            if (duration >= chickItem.day * consume.chickItemAmount) {
                datesToSubtract = chickItem.day * consume.chickItemAmount;
            } else {
                datesToSubtract = duration;
            }

            bool success = pulletChickManager.usingGrowItem(
                consume.PulletChickTokenId,
                msg.sender,
                datesToSubtract
            );

            if (success) {
                emit ChickConsumeItem(
                    consume.PulletChickContract,
                    consume.PulletChickTokenId,
                    consume.chickItemContract,
                    consume.chickItemTokenId,
                    consume.chickItemAmount,
                    datesToSubtract
                );
            }
        }
    }

    // ############ chick grow ############
    error ChickGrowManagerError(address _cockContract);
    error ChickGrowOwnerError(address _owner);
    error ChickGrowUnsatisfactoryTime(uint256 _timestamp);

    event CockMint(
        address owner,
        uint256 attack,
        uint256 attackSpeed,
        uint256 critChance,
        uint256 health,
        uint256 evasion
    );
    event HenMint(address owner);

    // 수병아리 성장
    // start require 721 approveAll to cockFight.sol
    function cockerelChickGrow(
        address _cockerelChickContract,
        uint256 _tokenId
    ) public isBlackListWallet(msg.sender) nonReentrant {
        if (cockerelChickManager != ICockerelChick(_cockerelChickContract)) {
            revert ChickGrowManagerError(_cockerelChickContract);
        }
        if (cockerelChickManager.ownerOf(_tokenId) != msg.sender) {
            revert ChickGrowOwnerError(msg.sender);
        }

        ICockerelChick.ChickGrowStruct
            memory cockerelGrow = cockerelChickManager.grow(_tokenId);

        if (cockerelGrow.timestamp30Days > block.timestamp) {
            revert ChickGrowUnsatisfactoryTime(cockerelGrow.timestamp30Days);
        }

        // burn
        cockerelChickManager.safeTransferFrom(
            msg.sender,
            deadAddress,
            _tokenId
        );

        ICockerelChick.ChickStats memory cockerelStats = cockerelChickManager
            .stats(_tokenId);

        // mint
        cockManager.mint(
            msg.sender,
            cockerelStats.attack,
            cockerelStats.attackSpeed,
            cockerelStats.critChance,
            cockerelStats.health,
            cockerelStats.evasion
        );

        emit CockMint(
            msg.sender,
            cockerelStats.attack,
            cockerelStats.attackSpeed,
            cockerelStats.critChance,
            cockerelStats.health,
            cockerelStats.evasion
        );
    }

    // 암병아리 성장
    // start require 721 approveAll to cockFight.sol
    function pulletChickGrow(
        address _pulletChickContract,
        uint256 _tokenId
    ) public isBlackListWallet(msg.sender) nonReentrant {
        if (pulletChickManager != IPulletChick(_pulletChickContract)) {
            revert ChickGrowManagerError(_pulletChickContract);
        }

        if (pulletChickManager.ownerOf(_tokenId) != msg.sender) {
            revert ChickGrowOwnerError(msg.sender);
        }

        IPulletChick.ChickGrowStruct memory pulletGrow = pulletChickManager
            .grow(_tokenId);

        if (pulletGrow.timestamp30Days > block.timestamp) {
            revert ChickGrowUnsatisfactoryTime(pulletGrow.timestamp30Days);
        }

        // burn
        pulletChickManager.safeTransferFrom(msg.sender, deadAddress, _tokenId);

        // mint
        henManager.mint(msg.sender);

        emit HenMint(msg.sender);
    }

    // ----------------------- chicken section -----------------------
    // 닭 입장 퇴장 제어
    function manageCockEntry(
        uint256 _tokenId,
        uint256 _status
    ) public isWhiteListControl(msg.sender) nonReentrant {
        require(_status != 1, "1 is not supported");

        ICock.ChickGame memory chickStatus = cockManager.game(_tokenId);

        require(chickStatus.status != _status, "Already Updated status");

        cockManager.updateCockGameStatus(_tokenId, _status, 0, 0, 0);
    }

    // 닭 전투 싸움 / 전투 결과 업데이트
    function cockGameUpdate(
        uint256 _tokenId,
        uint256 _status,
        uint256 _win,
        uint256 _lose,
        uint256 _draw
    ) public isWhiteListControl(msg.sender) nonReentrant {
        ICock.ChickGame memory chickStatus = cockManager.game(_tokenId);

        require(chickStatus.status != 1, "Already dead!");

        cockManager.updateCockGameStatus(_tokenId, _status, _win, _lose, _draw);
    }

    event CockLifeItem(
        address _cockContract,
        uint256 _cockTokenId,
        address _cockItemContract,
        uint256 _cockItemTokenId,
        uint256 _cockItemAmount,
        address owner
    );

    //  닭 부활 아이템 사용
    // start require 1155 approveAll to cockFight.sol
    function cockUseLifeItem(
        ItemTypes.CockConsumeItem calldata consume
    ) public nonReentrant {
        // check
        if (
            cockManager != ICock(consume.CockContract) &&
            cockItemManager != ICockItem(consume.cockItemContract)
        ) {
            revert ConsumeManagerError(
                consume.CockContract,
                consume.cockItemContract
            );
        }
        if (cockManager.ownerOf(consume.CockTokenId) != msg.sender) {
            revert ConsumeOwnerError(msg.sender);
        }
        if (
            cockItemManager.balanceOf(msg.sender, consume.cockItemTokenId) <
            consume.cockItemAmount
        ) {
            revert ConsumeItemNotEnoughError(
                msg.sender,
                consume.cockItemTokenId
            );
        }
        if (consume.cockItemAmount > 1) {
            revert ConsumeItemNotEnoughError(
                msg.sender,
                consume.cockItemTokenId
            );
        }

        ICock.ChickGame memory cock = cockManager.game(consume.CockTokenId);

        // is dead check
        require(cock.status == 1, "Cock is not dead");

        // 1155 burn
        cockItemManager.burn(
            msg.sender,
            consume.cockItemTokenId,
            consume.cockItemAmount
        );

        cockManager.updateCockLife(consume.CockTokenId);

        emit CockLifeItem(
            consume.CockContract,
            consume.CockTokenId,
            consume.cockItemContract,
            consume.cockItemTokenId,
            consume.cockItemAmount,
            msg.sender
        );
    }

    // ----------------------- item section -----------------------
    event EggItemBuy(
        address eggItemContract,
        address owner,
        uint256 tokenId,
        uint256 amount,
        uint256 price
    );
    event ChickItemBuy(
        address chickItemContract,
        address owner,
        uint256 tokenId,
        uint256 amount,
        uint256 price
    );
    event CockItemBuy(
        address cockItemContract,
        address owner,
        uint256 tokenId,
        uint256 amount,
        uint256 price
    );

    function eggItemBuy(uint256 _tokenId, uint256 _amount) public nonReentrant {
        require(_amount > 0, "Must be at least zero.");

        ItemTypes.EggItem memory item = eggItemManager.tokenURIs(_tokenId);

        require(item.isSale, "Not sale item");
        require(item.price > 0, "Not sale item");

        tokenManager.safeTransferFrom(
            msg.sender,
            address(this),
            item.price * _amount
        );

        eggItemManager.mint(msg.sender, _tokenId, _amount, "0x");

        emit EggItemBuy(
            address(eggItemManager),
            msg.sender,
            _tokenId,
            _amount,
            item.price * _amount
        );
    }

    function chickItemBuy(
        uint256 _tokenId,
        uint256 _amount
    ) public nonReentrant {
        require(_amount > 0, "Must be at least zero.");

        ItemTypes.ChickItem memory item = chickItemManager.tokenURIs(_tokenId);

        require(item.isSale, "Not sale item");
        require(item.price > 0, "Not sale item");

        tokenManager.safeTransferFrom(
            msg.sender,
            address(this),
            item.price * _amount
        );

        chickItemManager.mint(msg.sender, _tokenId, _amount, "0x");

        emit ChickItemBuy(
            address(chickItemManager),
            msg.sender,
            _tokenId,
            _amount,
            item.price * _amount
        );
    }

    function cockItemBuy(
        uint256 _tokenId,
        uint256 _amount
    ) public nonReentrant {
        require(_amount > 0, "Must be at least zero.");

        ItemTypes.CockItem memory item = cockItemManager.tokenURIs(_tokenId);

        require(item.isSale, "Not sale item");
        require(item.price > 0, "Not sale item");

        tokenManager.safeTransferFrom(
            msg.sender,
            address(this),
            item.price * _amount
        );

        cockItemManager.mint(msg.sender, _tokenId, _amount, "0x");

        emit CockItemBuy(
            address(cockItemManager),
            msg.sender,
            _tokenId,
            _amount,
            item.price * _amount
        );
    }
}
