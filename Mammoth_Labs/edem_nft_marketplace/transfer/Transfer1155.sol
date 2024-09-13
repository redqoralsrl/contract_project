// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ITransferExecution} from "../interfaces/ITransferExecution.sol";

contract Transfer1155 is ITransferExecution {
    address public immutable EDEM;

    constructor(address _edem) {
        EDEM = _edem;
    }

    function transferFrom(
        address collection,
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    ) external override {
        require(msg.sender == EDEM, "Not available outside of EDEM");
        IERC1155(collection).safeTransferFrom(from, to, tokenId, amount, "");
    }
}
