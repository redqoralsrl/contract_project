// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

library ItemTypes {
    struct EggItem {
        uint256 tokenId;
        // sale
        bool isSale;
        uint256 price;
        uint256 day;
    }

    struct EggConsumeItem {
        address eggContract;
        uint256 eggTokenId;
        address eggItemContract;
        uint256 eggItemTokenId;
        uint256 eggItemAmount;
    }

    struct ChickItem {
        uint256 tokenId;
        bool isPulletPossible;
        bool isSale;
        uint256 price;
        uint256 day;
        uint256 statsIndex;
    }

    struct ChickConsumeItem {
        address CockerelChickContract;
        uint256 CockerelChickTokenId;
        address PulletChickContract;
        uint256 PulletChickTokenId;
        address chickItemContract;
        uint256 chickItemTokenId;
        uint256 chickItemAmount;
    }

    struct CockItem {
        uint256 tokenId;
        bool isSale;
        uint256 price;
        bool healing;
    }

    struct CockConsumeItem {
        address CockContract;
        uint256 CockTokenId;
        address cockItemContract;
        uint256 cockItemTokenId;
        uint256 cockItemAmount;
    }
}
