// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {MarketTypes} from "../libraries/MarketTypes.sol";

interface IEdem {
    function proposerPayETH(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external payable;

    function proposerPayETHAndWETH(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external payable;

    function proposerPay(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external;

    function suggestApprove(
        MarketTypes.User calldata userSeller,
        MarketTypes.MarketPlace calldata marketProposer
    ) external;
}
