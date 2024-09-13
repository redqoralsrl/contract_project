// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../interfaces/ICFNAccessControl.sol";

contract Hen is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    ICFNAccessControl public accessControl;

    string private url;
    string private deathUrl;
    uint256 public maxDay;

    mapping(uint256 => HenStaking) public info;
    struct HenStaking {
        bool isDead; // true -> die false -> live
        uint256 eggStaking; // start with 0 day
        uint256 maxDay; // maxDay start with 365 day
    }

    event HenMint(address _owner, uint256 _tokenId);

    constructor(address _accessControl) ERC721("CFN Hen", "CFNH") {
        url = "https://img.cf-n.io/jsons/Hen/hen.json";
        deathUrl = "https://img.cf-n.io/jsons/Hen/deathHen.json";
        maxDay = 365 * 24 * 60 * 60; // 365 day
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

    function setAccessControl(
        address _ca
    ) public isWhiteListControl(msg.sender) {
        accessControl = ICFNAccessControl(_ca);
    }

    function _baseURI() internal view override returns (string memory) {
        return url;
    }

    function setUrl(string memory uri) public isWhiteListControl(msg.sender) {
        url = uri;
    }

    function updateMaxDay(
        uint256 _maxDay
    ) public isWhiteListControl(msg.sender) {
        maxDay = _maxDay;
    }

    function updateDeathUrl(
        string memory _deathUri
    ) public isWhiteListControl(msg.sender) {
        deathUrl = _deathUri;
    }

    function updateStakingHen(
        uint256 _tokenId,
        uint256 _stakingDay
    ) public isWhiteListControl(msg.sender) {
        require(ownerOf(_tokenId) != address(0), "Token does not exist.");
        require(_stakingDay > 0, "_stakingDay must be at least zero.");

        HenStaking storage hen = info[_tokenId];
        require(!hen.isDead, "Already dead.");
        require(hen.eggStaking < hen.maxDay, "Already staking finish");

        hen.eggStaking += _stakingDay;
    }

    function updateIsDead(
        uint256 _tokenId,
        bool _isDead
    ) public isWhiteListControl(msg.sender) {
        require(ownerOf(_tokenId) != address(0), "Token does not exist.");

        HenStaking storage hen = info[_tokenId];
        hen.isDead = _isDead;
    }

    function burn(uint256 _tokenId) public {
        require(
            _isApprovedOrOwner(_msgSender(), _tokenId),
            "ERC721: caller is not token owner or approved"
        );

        _burn(_tokenId);
    }

    function mint(
        address _to
    )
        public
        isBlackListWallet(_to)
        isWhiteListControl(msg.sender)
        nonReentrant
    {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        info[tokenId] = HenStaking(false, 0, maxDay);

        _safeMint(_to, tokenId);

        emit HenMint(_to, tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            ownerOf(tokenId) != address(0),
            "URI query for nonexistent token."
        );

        HenStaking memory hen = info[tokenId];

        if (hen.isDead) {
            return deathUrl;
        }

        return _baseURI();
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
