// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "../interfaces/ICFNAccessControl.sol";

contract PulletChick is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    ICFNAccessControl public accessControl;

    string private url;

    uint256 public ChickGrowTime = 30 * 24 * 60 * 60; // day, hour, minute, second -> 30days

    struct ChickGrowStruct {
        uint256 currentTimestamp;
        uint256 timestamp30Days;
    }

    mapping(uint256 => ChickGrowStruct) public grow;

    event ChickGrow(
        uint256 indexed tokenId,
        uint256 indexed currentTimestamp,
        uint256 timestamp30Days
    );
    event ChickUsingGrowItem(
        uint256 indexed tokenId,
        address indexed ownerAddress,
        uint256 datesToSubtract
    );

    constructor(address _accessControl) ERC721("CFN Pullet Chick", "CFNPC") {
        url = "https://img.cf-n.io/jsons/PulletChick/pullet.json";
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

    function getUrl() public view returns (string memory) {
        return _baseURI();
    }

    function setUrl(string memory _uri) public isWhiteListControl(msg.sender) {
        url = _uri;
    }

    function setChickGrowTime(
        uint256 _chickGrowTime
    ) public isWhiteListControl(msg.sender) {
        ChickGrowTime = _chickGrowTime;
    }

    function usingGrowItem(
        uint256 tokenId,
        address ownerAddress,
        uint256 datesToSubtract
    ) public isWhiteListControl(msg.sender) nonReentrant returns (bool) {
        require(
            datesToSubtract > 0,
            "Dates to subtract must be greater than zero."
        );
        require(ownerOf(tokenId) == ownerAddress, "Not owner");

        ChickGrowStruct storage chickInfo = grow[tokenId];

        require(
            chickInfo.timestamp30Days > chickInfo.currentTimestamp,
            "Time shrink error."
        );

        require(
            chickInfo.timestamp30Days >= datesToSubtract,
            "Cannot subtract more than the remaining time."
        );

        chickInfo.timestamp30Days -= datesToSubtract;

        emit ChickUsingGrowItem(tokenId, ownerAddress, datesToSubtract);

        return true;
    }

    function _safeMint(address _to, uint256 _tokenId) internal override {
        uint256 currentTimestamp = block.timestamp;
        uint256 timestamp30Days = currentTimestamp + ChickGrowTime;

        grow[_tokenId] = ChickGrowStruct(currentTimestamp, timestamp30Days);

        super._safeMint(_to, _tokenId);

        emit ChickGrow(_tokenId, currentTimestamp, timestamp30Days);
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
        _safeMint(_to, tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            ownerOf(tokenId) != address(0),
            "URI query for nonexistent token."
        );
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
