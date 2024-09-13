// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {MarketTypes} from "../libraries/MarketTypes.sol";

interface IProtocolAndExecution {
    function possibleAcceptSuggest(
        MarketTypes.User calldata userSeller,
        MarketTypes.MarketPlace calldata marketProposer
    ) external view returns (bool, uint256, uint256);

    function possiblePurchase(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external view returns (bool, uint256, uint256);

    function viewProtocolFee() external view returns (uint256);
}
