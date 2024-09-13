// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ICock is IERC721 {
    struct ChickGame {
        uint256 status; // 0 -> live 1 -> dead 2 -> game enter
        uint256 win;
        uint256 lose;
        uint256 draw;
    }

    struct CockStats {
        uint256 attack;
        uint256 attackSpeed;
        uint256 critChance;
        uint256 health;
        uint256 evasion;
    }

    event CockMint(
        uint256 tokenId,
        address owner,
        uint256 attack,
        uint256 attackSpeed,
        uint256 critChance,
        uint256 health,
        uint256 evasion
    );

    function url() external view returns (string memory);

    function fileExtention() external view returns (string memory);

    function game(uint256 tokenId) external view returns (ChickGame memory);

    function stats(uint256 tokenId) external view returns (CockStats memory);

    function setUrl(string memory uri) external;

    function setDeathUrl(string memory _uri) external;

    function updateCockGameStatus(
        uint256 _tokenId,
        uint256 _status,
        uint256 _win,
        uint256 _lose,
        uint256 _draw
    ) external;

    function updateCockLife(uint256 _tokenId) external;

    function burn(uint256 tokenId) external;

    function mint(
        address to,
        uint256 attack,
        uint256 attackSpeed,
        uint256 critChance,
        uint256 health,
        uint256 evasion
    ) external;

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
