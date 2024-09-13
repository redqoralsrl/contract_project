// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../interfaces/ICFNAccessControl.sol";

contract CockerelChick is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    ICFNAccessControl public accessControl;

    string private url;

    uint256 public ChickGrowTime = 30 * 24 * 60 * 60; // day, hour, minute, second -> 30days
    string private _secret_word = "CockerelChick";
    uint8[5][] public statSets = [
        [3, 2, 2, 2, 1],
        [2, 2, 2, 2, 2],
        [3, 3, 2, 1, 1]
    ]; // stat
    uint256 public maxUpgradeCounts = 10; // upgrade count
    uint256 public maxUpgradeStats = 10; // max upgrade stats

    uint256 public deatchVolume = 35; // 3.5%
    uint256 public failVolume = 200; // 20%
    uint256 public oneVolume = 700; // 70%
    uint256 public twoVolume = 65; // 6.5%

    struct ChickGrowStruct {
        uint256 currentTimestamp;
        uint256 timestamp30Days;
    }
    struct ChickStats {
        uint256 attack; // 0
        uint256 attackSpeed; // 1
        uint256 critChance; // 2
        uint256 health; // 3
        uint256 evasion; // 4
    }

    mapping(uint256 => ChickGrowStruct) public grow;
    mapping(uint256 => ChickStats) public stats;
    mapping(uint256 => uint256) public upgradeCounts;

    event NewSecretWord(string word);
    event ChickGrow(
        uint256 indexed tokenId,
        uint256 indexed currentTimestamp,
        uint256 timestamp30Days
    );
    event ChickStat(uint256 indexed _tokenId, ChickStats _chick_stat);
    event ChickUsingGrowItem(
        uint256 indexed tokenId,
        address indexed ownerAddress,
        uint256 datesToSubtract
    );
    event ChickUsingStatsUpgrade(
        uint256 indexed tokenId,
        address indexed ownerAddress,
        uint256 point,
        bool isDead
    );

    address deadAddress = 0x000000000000000000000000000000000000dEaD;

    constructor(address _accessControl) ERC721("CFN Cockerel Chick", "CFNCC") {
        url = "https://img.cf-n.io/jsons/CockerelChick/cockerel.json";
        accessControl = ICFNAccessControl(_accessControl);
    }

    modifier isBlackListWallet(address _address) {
        require(
            !accessControl.blackListWallet(_address),
            "Transaction denied: address is blacklisted"
        );
        _;
    }

    modifier isWhiteListControl(address _ca) {
        require(
            accessControl.whiteListControlAddress(_ca),
            "Unverified owner address"
        );
        _;
    }

    function setAccessControl(
        address _ca
    ) public isWhiteListControl(msg.sender) {
        accessControl = ICFNAccessControl(_ca);
    }

    function _baseURI() internal view override returns (string memory) {
        return url;
    }

    function getUrl() public view returns (string memory) {
        return _baseURI();
    }

    function setUrl(string memory _uri) public isWhiteListControl(msg.sender) {
        url = _uri;
    }

    function setChickGrowTime(
        uint256 _chickGrowTime
    ) public isWhiteListControl(msg.sender) {
        ChickGrowTime = _chickGrowTime;
    }

    function updateSecretWord(
        string memory _newSecret
    ) public isWhiteListControl(msg.sender) {
        _secret_word = _newSecret;

        emit NewSecretWord(_newSecret);
    }

    function setStatSets(
        uint8[5][] memory _settingStat
    ) public isWhiteListControl(msg.sender) {
        statSets = _settingStat;
    }

    function setMaxUpgradeCounts(
        uint256 _counts
    ) public isWhiteListControl(msg.sender) {
        maxUpgradeCounts = _counts;
    }

    function setMaxUpgradeStats(
        uint256 _stats
    ) public isWhiteListControl(msg.sender) {
        maxUpgradeStats = _stats;
    }

    function _getAvailableIndex(
        uint256 statIndex,
        bool[5] memory usedIndices
    ) private pure returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < 5; i++) {
            if (!usedIndices[i]) {
                if (count == statIndex) {
                    return i;
                }
                count++;
            }
        }
        revert("No available index found");
    }

    function _generate_stats(
        address _to,
        uint256 _tokenId
    ) private view returns (ChickStats memory) {
        uint256 randomValue = uint256(
            keccak256(
                abi.encodePacked(
                    _secret_word,
                    _tokenId,
                    _to,
                    msg.sender,
                    block.timestamp
                )
            )
        );

        uint256 statSetIndex = randomValue % statSets.length;
        uint8[5] memory selectedStatSet = statSets[statSetIndex];

        bool[5] memory usedIndices;
        ChickStats memory chickStats;

        for (uint8 i = 0; i < 5; i++) {
            uint256 statIndex = randomValue % (5 - i);
            uint256 availableIndex = _getAvailableIndex(statIndex, usedIndices);
            usedIndices[availableIndex] = true;

            if (i == 0) {
                chickStats.attack = selectedStatSet[availableIndex];
            } else if (i == 1) {
                chickStats.attackSpeed = selectedStatSet[availableIndex];
            } else if (i == 2) {
                chickStats.critChance = selectedStatSet[availableIndex];
            } else if (i == 3) {
                chickStats.health = selectedStatSet[availableIndex];
            } else if (i == 4) {
                chickStats.evasion = selectedStatSet[availableIndex];
            }

            randomValue = randomValue >> 8;
        }

        return chickStats;
    }

    function usingGrowItem(
        uint256 tokenId,
        address ownerAddress,
        uint256 datesToSubtract
    ) public isWhiteListControl(msg.sender) nonReentrant returns (bool) {
        require(
            datesToSubtract > 0,
            "Dates to subtract must be greater than zero."
        );
        require(ownerOf(tokenId) == ownerAddress, "Not owner");

        ChickGrowStruct storage chickInfo = grow[tokenId];

        require(
            chickInfo.timestamp30Days > chickInfo.currentTimestamp,
            "Time shrink error."
        );

        require(
            chickInfo.timestamp30Days >= datesToSubtract,
            "Cannot subtract more than the remaining time."
        );

        chickInfo.timestamp30Days -= datesToSubtract;

        emit ChickUsingGrowItem(tokenId, ownerAddress, datesToSubtract);

        return true;
    }

    function _gerneate_upgrade(
        address _to,
        uint256 _tokenId
    ) private view returns (uint256 point, bool isDead) {
        uint256 randomValue = uint256(
            keccak256(
                abi.encodePacked(
                    _secret_word,
                    _to,
                    _tokenId,
                    upgradeCounts[_tokenId],
                    block.timestamp
                )
            )
        );

        uint256 result = randomValue % 1000;

        // 0 ~ 35
        if (result <= deatchVolume) {
            point = 0;
            isDead = true;
            // 36 ~ 235
        } else if (result <= failVolume + deatchVolume) {
            point = 0;
            isDead = false;
            // 236 ~ 935
        } else if (result <= oneVolume + failVolume + deatchVolume) {
            point = 1;
            isDead = false;
            // 936 ~ 1000
        } else if (
            result <= oneVolume + failVolume + deatchVolume + twoVolume
        ) {
            point = 2;
            isDead = false;
        } else {
            point = 0;
            isDead = true;
        }
    }

    // require 721 approveAll to cockFight.sol
    function usingStatUpgrade(
        uint256 tokenId,
        address ownerAddress,
        uint256 statIndex
    )
        public
        isWhiteListControl(msg.sender)
        nonReentrant
        returns (uint256 point, bool isDead)
    {
        require(ownerOf(tokenId) == ownerAddress, "Not owner");

        require(statIndex >= 0 && statIndex <= 4, "Invalid stat index");

        if (statIndex == 0) {
            require(
                stats[tokenId].attack < maxUpgradeStats,
                "Attack stat is already maxed at 10"
            );
        } else if (statIndex == 1) {
            require(
                stats[tokenId].attackSpeed < maxUpgradeStats,
                "Attack Speed stat is already maxed at 10"
            );
        } else if (statIndex == 2) {
            require(
                stats[tokenId].critChance < maxUpgradeStats,
                "Crit Chance stat is already maxed at 10"
            );
        } else if (statIndex == 3) {
            require(
                stats[tokenId].health < maxUpgradeStats,
                "Health stat is already maxed at 10"
            );
        } else if (statIndex == 4) {
            require(
                stats[tokenId].evasion < maxUpgradeStats,
                "Evasion stat is already maxed at 10"
            );
        }

        uint256 upgradeCount = upgradeCounts[tokenId];

        require(upgradeCount > 0, "Not enough upgrade count");

        (uint256 _point, bool _isDead) = _gerneate_upgrade(
            ownerAddress,
            tokenId
        );

        if (_isDead) {
            burn(tokenId);
            point = _point;
            isDead = _isDead;
        } else {
            upgradeCounts[tokenId] = upgradeCount - 1;

            // stats upgrade
            if (statIndex == 0) {
                stats[tokenId].attack += _point;
                if (stats[tokenId].attack > maxUpgradeStats) {
                    stats[tokenId].attack = maxUpgradeStats;
                }
            } else if (statIndex == 1) {
                stats[tokenId].attackSpeed += _point;
                if (stats[tokenId].attackSpeed > maxUpgradeStats) {
                    stats[tokenId].attackSpeed = maxUpgradeStats;
                }
            } else if (statIndex == 2) {
                stats[tokenId].critChance += _point;
                if (stats[tokenId].critChance > maxUpgradeStats) {
                    stats[tokenId].critChance = maxUpgradeStats;
                }
            } else if (statIndex == 3) {
                stats[tokenId].health += _point;
                if (stats[tokenId].health > maxUpgradeStats) {
                    stats[tokenId].health = maxUpgradeStats;
                }
            } else if (statIndex == 4) {
                stats[tokenId].evasion += _point;
                if (stats[tokenId].evasion > maxUpgradeStats) {
                    stats[tokenId].evasion = maxUpgradeStats;
                }
            }

            point = _point;
            isDead = _isDead;
        }

        emit ChickUsingStatsUpgrade(tokenId, ownerAddress, _point, _isDead);
    }

    function _safeMint(address _to, uint256 _tokenId) internal override {
        uint256 currentTimestamp = block.timestamp;
        uint256 timestamp30Days = currentTimestamp + ChickGrowTime;

        ChickStats memory chickResultStats = _generate_stats(_to, _tokenId);

        require(
            chickResultStats.attack +
                chickResultStats.attackSpeed +
                chickResultStats.critChance +
                chickResultStats.health +
                chickResultStats.evasion ==
                10,
            "Generate stats random error"
        );

        stats[_tokenId] = chickResultStats;
        grow[_tokenId] = ChickGrowStruct(currentTimestamp, timestamp30Days);
        upgradeCounts[_tokenId] = 10;
        super._safeMint(_to, _tokenId);

        emit ChickStat(_tokenId, chickResultStats);
        emit ChickGrow(_tokenId, currentTimestamp, timestamp30Days);
    }

    function burn(uint256 _tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), _tokenId),
            "ERC721: caller is not token owner or approved"
        );

        _burn(_tokenId);
    }

    function mint(
        address _to
    )
        public
        isBlackListWallet(_to)
        isWhiteListControl(msg.sender)
        nonReentrant
    {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(_to, tokenId);
    }

    function batchMint(
        address _to,
        uint256 numberOfTokens
    )
        public
        isBlackListWallet(_to)
        isWhiteListControl(msg.sender)
        nonReentrant
    {
        require(numberOfTokens > 0, "Must be at least one.");
        require(numberOfTokens < 11, "Must be less than 10.");

        for (uint i = 0; i < numberOfTokens; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(_to, tokenId);
        }
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            ownerOf(tokenId) != address(0),
            "URI query for nonexistent token."
        );
        return _baseURI();
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
