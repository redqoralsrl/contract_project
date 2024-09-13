// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {MarketTypes} from "../libraries/MarketTypes.sol";
import {IProtocolAndExecution} from "../interfaces/IProtocolAndExecution.sol";

contract ProtocolAndExecution is Ownable, IProtocolAndExecution {
    // Edem 프로토콜 수수료 바뀔때 마다
    event NewProtocolFee(uint256 protocolFee);

    // Edem 프로토콜 수수료 (10,000 = 100% / 500 => 5% / 150 => 1.5%)
    uint256 internal _protocolFee = 10;

    // Edem NFT 판매자가 제안을 수락할 수 있는지 여부
    function possibleAcceptSuggest(
        MarketTypes.User calldata userSeller,
        MarketTypes.MarketPlace calldata marketProposer
    ) external view override returns (bool, uint256, uint256) {
        return (
            ((marketProposer.price == userSeller.price) &&
                (marketProposer.tokenId == userSeller.tokenId) &&
                (marketProposer.endTime >= block.timestamp) &&
                (marketProposer.startTime <= block.timestamp)),
            userSeller.tokenId,
            marketProposer.nftAmount
        );
    }

    // Edem NFT 구매자가 판매상품을 살 수 있는지 여부
    function possiblePurchase(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external view override returns (bool, uint256, uint256) {
        return (
            (
                (marketSeller.price == userProposer.price) &&
                    (marketSeller.tokenId == marketSeller.tokenId) &&
                    (marketSeller.startTime <= block.timestamp) &&
                    (marketSeller.endTime >= block.timestamp),
                marketSeller.tokenId,
                marketSeller.nftAmount
            )
        );
    }

    // Edem 프로토콜 수수료 변경
    function setProtocolFee(uint256 newProtocolFee) external onlyOwner {
        _protocolFee = newProtocolFee;
        emit NewProtocolFee(newProtocolFee);
    }

    // Edem 프로토콜 수수료 보기
    function viewProtocolFee() external view override returns (uint256) {
        return _protocolFee;
    }
}
