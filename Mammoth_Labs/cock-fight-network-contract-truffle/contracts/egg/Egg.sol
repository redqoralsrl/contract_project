// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./OwnerWhiteList.sol";
import "./interfaces/IEgg.sol";

contract Egg is ERC721, OwnerWhiteList, IEgg {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    string private url;
    bool public saleIsActive = false;

    uint256 public EggHatchingTime = 3 * 7 * 24 * 60 * 60; // week, day, hour, minute, second -> 3weeks

    struct EggHatchStruct {
        uint256 currentTimestamp;
        uint256 timestamp3Weeks;
    }

    mapping(uint256 => EggHatchStruct) public hatch;

    event EggHatch(
        uint256 indexed tokenId,
        uint256 indexed currentTimestamp,
        uint256 timestamp3Weeks
    );
    event EggHatchUsingItem(
        uint256 indexed tokenId,
        address indexed usingAddress,
        uint256 subtract
    );

    mapping(address => bool) public blacklist;

    event BlackListAddressAdded(address addr);
    event BlackListAddressRemoved(address addr);

    modifier notBlacklisted() {
        require(!blacklist[msg.sender], "Caller is blacklisted.");
        _;
    }

    modifier notBlacklistedWallet(address _from, address _to) {
        require(!blacklist[_from], "From address is blacklisted.");
        require(!blacklist[_to], "To address is blacklisted.");
        _;
    }

    constructor() ERC721("CFN Egg", "CFNE") {
        url = "https://img.cf-n.io/jsons/egg.json";
    }

    function _baseURI() internal view override returns (string memory) {
        return url;
    }

    function getUrl() public view override returns (string memory) {
        return _baseURI();
    }

    function setUrl(string memory _uri) public override onlyWhitelisted {
        url = _uri;
    }

    function setSaleIsActive(bool _isActive) public override onlyWhitelisted {
        saleIsActive = _isActive;
    }

    function setEggHatchingTime(
        uint256 _eggHatchingTime
    ) public override onlyWhitelisted {
        EggHatchingTime = _eggHatchingTime;
    }

    function addAddressToBlacklist(
        address _addr
    ) public override onlyWhitelisted returns (bool success) {
        if (!blacklist[_addr]) {
            blacklist[_addr] = true;
            emit BlackListAddressAdded(_addr);
            success = true;
        }
    }

    function removeAddressFromBlacklist(
        address _addr
    ) public override onlyWhitelisted returns (bool success) {
        if (blacklist[_addr]) {
            blacklist[_addr] = false;
            emit BlackListAddressRemoved(_addr);
            success = true;
        }
    }

    function usingItem(
        uint256 tokenId,
        address ownerAddress,
        uint256 datesToSubtract
    ) public override onlyWhitelisted returns (bool) {
        require(
            datesToSubtract > 0,
            "Dates to subtract must be greater than zero."
        );
        require(ownerOf(tokenId) == ownerAddress, "Not owner");

        EggHatchStruct storage eggH = hatch[tokenId];
        require(
            eggH.timestamp3Weeks >= datesToSubtract &&
                eggH.timestamp3Weeks - datesToSubtract >= 0 &&
                eggH.timestamp3Weeks - datesToSubtract >= eggH.currentTimestamp,
            "Cannot subtract more than the remaining time."
        );

        eggH.timestamp3Weeks -= datesToSubtract;

        emit EggHatchUsingItem(tokenId, ownerAddress, datesToSubtract);

        return true;
    }

    function _safeMint(address _to, uint256 tokenId) internal override {
        uint256 currentTimestamp = block.timestamp;
        uint256 timestamp3Weeks = currentTimestamp + EggHatchingTime;

        hatch[tokenId] = EggHatchStruct(currentTimestamp, timestamp3Weeks);

        super._safeMint(_to, tokenId);

        emit EggHatch(tokenId, currentTimestamp, timestamp3Weeks);
    }

    function mint(address _to) public override onlyWhitelisted {
        require(saleIsActive, "Sale must be active.");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(_to, tokenId);
    }

    function batchMint(
        address _to,
        uint256 numberOfTokens
    ) public override onlyWhitelisted {
        require(saleIsActive, "Sale must be active.");
        require(numberOfTokens > 0, "Must be at least one.");

        for (uint i = 0; i < numberOfTokens; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(_to, tokenId);
        }
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
    ) public override notBlacklisted notBlacklistedWallet(from, to) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override notBlacklisted notBlacklistedWallet(from, to) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override notBlacklisted notBlacklistedWallet(from, to) {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
