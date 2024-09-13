// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MarketTypes
 * @notice This library containes Market types for the Edem Market.
 */
library MarketTypes {
    // Market hash

    // MarketPlace(bool isDealer,address edemSigner,address collection,uint256 tokenId,uint256 nftAmount,uint256 price,address protocolAddress,address tradeTokenAddress,uint256 nonce,uint256 startTime,uint256 endTime)
    bytes32 internal constant MARKET_PLACE_HASH =
        0x821b23108860b2262fa623d45a26073021dcb49a4ad5e89488e070794630832a;

    // Market 판매 목록 혹은 제안 목록
    struct MarketPlace {
        bool isDealer; // true -> NFT seller / false -> NFT proposer
        address edemSigner; // signer of the MarketPlace order
        address collection; // NFT contract Address
        uint256 tokenId; // NFT token Id
        uint256 nftAmount; // Must be 1 for ERC721, 1+ for ERC1155
        uint256 price; // NFT price 1ETH => 1000000000000000000
        address protocolAddress; // trade execution / protocol Fee
        address tradeTokenAddress; // curreny with WETH ...
        uint256 nonce; // New sales information is unique unless it ignores existing sales information
        uint256 startTime; // start timestamp
        uint256 endTime; // end timestamp
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    // Market 상품을 사는 사람 / 상품에 제안을 하는 사람
    struct User {
        bool isDealer; // true -> NFT seller / false -> NFT proposer
        address takerAddress; // msg.sender
        uint256 price; // purchase Amount
        uint256 tokenId; // NFT token Id
    }

    // hash
    function hash(
        MarketPlace memory marketPlace
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    MARKET_PLACE_HASH,
                    marketPlace.isDealer,
                    marketPlace.edemSigner,
                    marketPlace.collection,
                    marketPlace.tokenId,
                    marketPlace.nftAmount,
                    marketPlace.price,
                    marketPlace.protocolAddress,
                    marketPlace.tradeTokenAddress,
                    marketPlace.nonce,
                    marketPlace.startTime,
                    marketPlace.endTime
                )
            );
    }
}
