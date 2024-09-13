// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ITransferExecution} from "../interfaces/ITransferExecution.sol";

contract Unsupported721 is ITransferExecution {
    address public immutable EDEM;

    constructor(address _edem) {
        EDEM = _edem;
    }

    function transferFrom(
        address collection,
        address from,
        address to,
        uint256 tokenId,
        uint256
    ) external override {
        require(msg.sender == EDEM, "Not available outside of EDEM");
        IERC721(collection).transferFrom(from, to, tokenId);
    }
}
