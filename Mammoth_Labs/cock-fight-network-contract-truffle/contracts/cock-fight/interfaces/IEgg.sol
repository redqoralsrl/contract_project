// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

interface IEgg {
    struct EggHatchStruct {
        uint256 currentTimestamp;
        uint256 timestamp3Weeks;
    }

    event EggHatch(
        uint256 indexed tokenId,
        uint256 indexed currentTimestamp,
        uint256 timestamp3Weeks
    );

    event EggHatchUsingItem(
        uint256 indexed tokenId,
        address indexed usingAddress,
        uint256 subtract
    );

    event BlackListAddressAdded(address addr);
    event BlackListAddressRemoved(address addr);

    function getUrl() external view returns (string memory);

    function setUrl(string memory _uri) external;

    function setSaleIsActive(bool _isActive) external;

    function setEggHatchingTime(uint256 _eggHatchingTime) external;

    function addAddressToBlacklist(
        address _addr
    ) external returns (bool success);

    function removeAddressFromBlacklist(
        address _addr
    ) external returns (bool success);

    function usingItem(
        uint256 tokenId,
        address ownerAddress,
        uint256 datesToSubtract
    ) external returns (bool);

    function mint(address _to) external;

    function batchMint(address _to, uint256 numberOfTokens) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function transferFrom(address from, address to, uint256 tokenId) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) external;

    function hatch(
        uint256 tokenId
    ) external view returns (EggHatchStruct memory);

    function blacklist(address addr) external view returns (bool);

    function ownerOf(uint256 tokenId) external view returns (address owner);

    function approve(address to, uint256 tokenId) external;

    function setApprovalForAll(address operator, bool approved) external;

    function getApproved(
        uint256 tokenId
    ) external view returns (address operator);

    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);
}
