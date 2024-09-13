// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IRoyaltyManager {
    function recipientWithroyaltyDeductionAmount(
        address collection,
        uint256 tokenId,
        uint256 amount
    ) external view returns (address, uint256);
}
