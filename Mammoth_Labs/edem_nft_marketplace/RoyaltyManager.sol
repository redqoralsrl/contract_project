// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165, IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";

import {IRoyaltyManager} from "./interfaces/IRoyaltyManager.sol";
import {IRoyalty} from "./interfaces/IRoyalty.sol";

contract RoyaltyManager is IRoyaltyManager, Ownable {
    // https://eips.ethereum.org/EIPS/eip-2981
    bytes4 public constant INTERFACE_ID_ERC2981 = 0x2a55205a;

    IRoyalty public immutable royalty;

    constructor(address _royalty) {
        royalty = IRoyalty(_royalty);
    }

    function recipientWithroyaltyDeductionAmount(
        address collection,
        uint256 tokenId,
        uint256 amount
    ) external view override returns (address, uint256) {
        (address receiver, uint256 royaltyAmount) = royalty.royaltyInfo(
            collection,
            amount
        );

        if ((receiver == address(0)) || (royaltyAmount == 0)) {
            if (IERC165(collection).supportsInterface(INTERFACE_ID_ERC2981)) {
                (receiver, royaltyAmount) = IERC2981(collection).royaltyInfo(
                    tokenId,
                    amount
                );
            }
        }

        return (receiver, royaltyAmount);
    }
}
