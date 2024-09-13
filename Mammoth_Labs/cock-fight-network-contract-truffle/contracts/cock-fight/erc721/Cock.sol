// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../interfaces/ICFNAccessControl.sol";

contract Cock is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    ICFNAccessControl public accessControl;

    string private url;
    string public fileExtention = ".json";
    string private deathUrl;

    mapping(uint256 => ChickGame) public game;
    mapping(uint256 => CockStats) public stats;
    struct ChickGame {
        uint256 status; // 0 -> live 1 -> dead 2 -> game enter
        uint256 win;
        uint256 lose;
        uint256 draw;
    }
    struct CockStats {
        uint256 attack; // 0
        uint256 attackSpeed; // 1
        uint256 critChance; // 2
        uint256 health; // 3
        uint256 evasion; // 4
    }

    event CockMint(
        uint256 _tokenId,
        address _owner,
        uint256 _attack,
        uint256 _attackSpeed,
        uint256 _critChance,
        uint256 _health,
        uint256 _evasion
    );
    event CockGameStatus(
        uint256 _tokenId,
        uint256 _status,
        uint256 _win,
        uint256 _lose,
        uint256 _draw
    );
    event CockLife(
        uint256 _tokenId,
        uint256 _status,
        uint256 _win,
        uint256 _lose,
        uint256 _draw
    );

    constructor(address _accessControl) ERC721("CFN Cock", "CFNC") {
        url = "https://img.cf-n.io/jsons/Cock/";
        deathUrl = "https://img.cf-n.io/jsons/Cock/death.json";
        accessControl = ICFNAccessControl(_accessControl);
    }

    modifier isBlackListWallet(address _address) {
        require(
            !accessControl.blackListWallet(_address),
            "Transaction denied: address is blacklisted"
        );
        _;
    }

    modifier isWhiteListControl(address _ca) {
        require(
            accessControl.whiteListControlAddress(_ca),
            "Unverified owner address"
        );
        _;
    }

    function _baseURI() internal view override returns (string memory) {
        return url;
    }

    function setUrl(string memory uri) public isWhiteListControl(msg.sender) {
        url = uri;
    }

    function setDeathUrl(
        string memory _uri
    ) public isWhiteListControl(msg.sender) {
        deathUrl = _uri;
    }

    // 0 -> live 1 -> dead 2 -> game enter
    function updateCockGameStatus(
        uint256 _tokenId,
        uint256 _status,
        uint256 _win,
        uint256 _lose,
        uint256 _draw
    ) public isWhiteListControl(msg.sender) {
        require(_win <= 1 && _lose <= 1, "Must be less than 2");

        ChickGame storage chickGameStatus = game[_tokenId];

        chickGameStatus.status = _status;
        if (_win > 0) {
            chickGameStatus.win += _win;
        }
        if (_lose > 0) {
            chickGameStatus.lose += _lose;
        }
        if (_draw > 0) {
            chickGameStatus.draw += _draw;
        }

        emit CockGameStatus(_tokenId, _status, _win, _lose, _draw);
    }

    error CockIsNotDeadError(uint256 _tokenId);

    function updateCockLife(
        uint256 _tokenId
    ) public isWhiteListControl(msg.sender) {
        ChickGame storage chickGameLife = game[_tokenId];

        if (chickGameLife.status == 1) {
            chickGameLife.status = 0;
            chickGameLife.win = 0;
            chickGameLife.lose = 0;
            chickGameLife.draw = 0;
            emit CockLife(
                _tokenId,
                chickGameLife.status,
                chickGameLife.win,
                chickGameLife.lose,
                chickGameLife.draw
            );
        } else {
            revert CockIsNotDeadError(_tokenId);
        }
    }

    function burn(uint256 _tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), _tokenId),
            "ERC721: caller is not token owner or approved"
        );

        _burn(_tokenId);
    }

    function mint(
        address _to,
        uint256 _attack,
        uint256 _attackSpeed,
        uint256 _critChance,
        uint256 _health,
        uint256 _evasion
    )
        public
        isBlackListWallet(_to)
        isWhiteListControl(msg.sender)
        nonReentrant
    {
        require(
            _attack >= 1 &&
                _attackSpeed >= 1 &&
                _critChance >= 1 &&
                _health >= 1 &&
                _evasion >= 1,
            "Stats must be at least zero."
        );

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        game[tokenId] = ChickGame(0, 0, 0, 0);
        stats[tokenId] = CockStats(
            _attack,
            _attackSpeed,
            _critChance,
            _health,
            _evasion
        );

        super._safeMint(_to, tokenId);

        emit CockMint(
            tokenId,
            _to,
            _attack,
            _attackSpeed,
            _critChance,
            _health,
            _evasion
        );
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            ownerOf(tokenId) != address(0),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory baseURI = _baseURI();

        ChickGame memory cockGameStatus = game[tokenId];

        if (cockGameStatus.status == 1) {
            return deathUrl;
        }

        return
            string(
                abi.encodePacked(baseURI, tokenId.toString(), fileExtention)
            );
    }

    error TransferDenied(uint256 _tokenId);

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        ChickGame memory gameInfo = game[tokenId];

        if (gameInfo.status == 2 || gameInfo.status == 1) {
            revert TransferDenied(tokenId);
        }

        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        ChickGame memory gameInfo = game[tokenId];

        if (gameInfo.status == 2 || gameInfo.status == 1) {
            revert TransferDenied(tokenId);
        }

        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        ChickGame memory gameInfo = game[tokenId];

        if (gameInfo.status == 2 || gameInfo.status == 1) {
            revert TransferDenied(tokenId);
        }

        super.safeTransferFrom(from, to, tokenId, data);
    }
}
