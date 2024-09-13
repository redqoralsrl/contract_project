// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ICockerelChick is IERC721 {
    // Structs
    struct ChickGrowStruct {
        uint256 currentTimestamp;
        uint256 timestamp30Days;
    }

    struct ChickStats {
        uint256 attack;
        uint256 attackSpeed;
        uint256 critChance;
        uint256 health;
        uint256 evasion;
    }

    // External functions
    function setAccessControl(address _ca) external;

    function getUrl() external view returns (string memory);

    function setUrl(string memory _uri) external;

    function setChickGrowTime(uint256 _chickGrowTime) external;

    function updateSecretWord(string memory _newSecret) external;

    function setStatSets(uint8[5][] memory _settingStat) external;

    function setMaxUpgradeCounts(uint256 _counts) external;

    function setMaxUpgradeStats(uint256 _stats) external;

    function usingGrowItem(
        uint256 tokenId,
        address ownerAddress,
        uint256 datesToSubtract
    ) external returns (bool);

    function usingStatUpgrade(
        uint256 tokenId,
        address ownerAddress,
        uint256 statIndex
    ) external returns (uint256 point, bool isDead);

    function mint(address _to) external;

    function batchMint(address _to, uint256 numberOfTokens) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function burn(uint256 _tokenId) external;

    // Getter functions for public mappings
    function grow(
        uint256 tokenId
    ) external view returns (ChickGrowStruct memory);

    function stats(uint256 tokenId) external view returns (ChickStats memory);

    function upgradeCounts(uint256 tokenId) external view returns (uint256);
}
