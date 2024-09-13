// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IPulletChick is IERC721 {
    // Structs
    struct ChickGrowStruct {
        uint256 currentTimestamp;
        uint256 timestamp30Days;
    }

    // Events
    event ChickGrow(
        uint256 indexed tokenId,
        uint256 indexed currentTimestamp,
        uint256 timestamp30Days
    );

    event ChickUsingGrowItem(
        uint256 indexed tokenId,
        address indexed ownerAddress,
        uint256 datesToSubtract
    );

    // External functions
    function setAccessControl(address _ca) external;

    function getUrl() external view returns (string memory);

    function setUrl(string memory _uri) external;

    function setChickGrowTime(uint256 _chickGrowTime) external;

    function usingGrowItem(
        uint256 tokenId,
        address ownerAddress,
        uint256 datesToSubtract
    ) external returns (bool);

    function burn(uint256 _tokenId) external;

    function mint(address _to) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external override;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external override;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external override;

    // Getter functions for public mappings
    function grow(
        uint256 tokenId
    ) external view returns (ChickGrowStruct memory);
}
