// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

interface IEgg {
    // Functions
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
}
