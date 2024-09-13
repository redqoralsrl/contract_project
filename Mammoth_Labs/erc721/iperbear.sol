// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract IperBear is ERC721, Ownable {

    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIdCounter;
    string public fileExtention = ".json";

    constructor() ERC721("IPER BEAR", "IB") {}

    function _baseURI() internal pure override returns (string memory) {
        return "https://bafybeigobbhpj3igkmpzw3bhuerbn662liuuiulzytqz65mhgi4qvfxi2q.ipfs.nftstorage.link/";
    }

    function mint(address _to) public onlyOwner {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _mint(_to, tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory baseURI = _baseURI();
        return string(abi.encodePacked(baseURI, tokenId.toString(), fileExtention));
    }

    function batchMint(address to, uint amount) public onlyOwner{
        for (uint i = 0; i < amount; i++) {
            mint(to);
        }
    }

}