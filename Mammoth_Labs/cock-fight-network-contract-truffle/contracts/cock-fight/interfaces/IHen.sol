// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IHen is IERC721 {
    struct HenStaking {
        bool isDead;
        uint256 eggStaking;
        uint256 maxDay;
    }

    function maxDay() external view returns (uint256);

    function info(uint256 tokenId) external view returns (HenStaking memory);

    function setAccessControl(address _ca) external;

    function setUrl(string memory uri) external;

    function updateMaxDay(uint256 _maxDay) external;

    function updateDeathUrl(string memory _deathUri) external;

    function updateStakingHen(uint256 _tokenId, uint256 _stakingDay) external;

    function updateIsDead(uint256 _tokenId, bool _isDead) external;

    function burn(uint256 _tokenId) external;

    function mint(address _to) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
