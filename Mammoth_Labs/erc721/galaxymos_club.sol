// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts@4.8.2/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts@4.8.2/access/Ownable.sol";
import "@openzeppelin/contracts@4.8.2/utils/Counters.sol";

contract Nft is ERC721, Ownable {

    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIdCounter;
    string public fileExtention = ".json";
    string private url;
    uint256 public max_count = 50000;

    constructor()
    ERC721("Galaxymos Club", "GC")
    {
        url = "https://edem-nft.s3.ap-northeast-2.amazonaws.com/Galaxymos/json/";
    }

    function _baseURI() internal view override returns (string memory) {
        return url;
    }

    function setUrl(string memory uri) public onlyOwner {
        url = uri;
    }

    function setMaxCount(uint256 _counts) public onlyOwner {
        require(max_count < _counts, "Must be greater than max_count");
        max_count = _counts;
    }

    function mint(address _to) public onlyOwner {
        require(_tokenIdCounter.current() < max_count, "Max count reached");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(_to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _baseURI();
        return string(abi.encodePacked(baseURI, tokenId.toString(), fileExtention));
    }
}
