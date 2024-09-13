// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRoyalty {
    function updateRoyaltyFeeLimit(uint256 _royaltyFeeLimit) external;

    function updateRoyaltyInfo(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) external;

    function royaltyInfo(
        address collection,
        uint256 amount
    ) external view returns (address, uint256);

    function royaltyInfoCollection(
        address collection
    ) external view returns (address, address, uint256);
}
