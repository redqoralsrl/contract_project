// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../interfaces/ICFNAccessControl.sol";
import {ItemTypes} from "../libraries/ItemTypes.sol";

contract EggItem is ERC1155 {
    using Strings for uint256;

    using ItemTypes for ItemTypes.EggItem;

    ICFNAccessControl public accessControl;

    // contract name, symbol
    string public name = "Egg Item";
    string public symbol = "EIN";

    mapping(uint256 => ItemTypes.EggItem) public tokenURIs;
    uint256[] public itemList;

    event AddItem(
        uint256 indexed tokenId,
        bool isSale,
        uint256 price,
        uint256 day
    );
    event UpdateIsSale(uint256 indexed tokenId, bool isSale);
    event UpdatePrice(uint256 indexed tokenId, uint256 price);
    event UpdateDay(uint256 indexed tokenId, uint256 day);

    constructor(
        address _accessControl
    ) ERC1155("https://img.cf-n.io/jsons/eggItem/") {
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

    function setURI(
        string memory _newUri
    ) public isWhiteListControl(msg.sender) {
        _setURI(_newUri);
    }

    function addItems(
        ItemTypes.EggItem calldata item
    ) public isWhiteListControl(msg.sender) {
        require(tokenURIs[item.tokenId].tokenId == 0, "Already exists");
        require(item.tokenId > 0, "Must be greater than zero");

        tokenURIs[item.tokenId] = item;

        itemList.push(item.tokenId);

        emit AddItem(item.tokenId, item.isSale, item.price, item.day);
    }

    function setIsSaleItem(
        uint256 _tokenId,
        bool _isSale
    ) public isWhiteListControl(msg.sender) {
        require(tokenURIs[_tokenId].tokenId != 0, "Undefined Item");

        tokenURIs[_tokenId].isSale = _isSale;

        emit UpdateIsSale(_tokenId, _isSale);
    }

    function setPriceItem(
        uint256 _tokenId,
        uint256 _price
    ) public isWhiteListControl(msg.sender) {
        require(tokenURIs[_tokenId].tokenId != 0, "Undefined Item");

        tokenURIs[_tokenId].price = _price;

        emit UpdatePrice(_tokenId, _price);
    }

    function setDayItem(
        uint256 _tokenId,
        uint256 _day
    ) public isWhiteListControl(msg.sender) {
        require(tokenURIs[_tokenId].tokenId != 0, "Undefined Item");

        tokenURIs[_tokenId].day = _day;

        emit UpdateDay(_tokenId, _day);
    }

    function getItemList() public view returns (uint256[] memory) {
        return itemList;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenURIs[tokenId].tokenId != 0, "Undefined Uri");

        return
            string(
                abi.encodePacked(
                    super.uri(tokenId),
                    Strings.toString(tokenId),
                    ".json"
                )
            );
    }

    function burn(address account, uint256 id, uint256 value) public {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burn(account, id, value);
    }

    function mint(
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes memory _data
    ) public isWhiteListControl(msg.sender) isBlackListWallet(_to) {
        require(tokenURIs[_id].tokenId != 0, "Undefined TokenId");

        _mint(_to, _id, _amount, _data);
    }

    function mintBatch(
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) public isWhiteListControl(msg.sender) isBlackListWallet(_to) {
        require(tokenURIs[_ids[0]].tokenId != 0, "Undefined TokenId");

        _mintBatch(_to, _ids, _amounts, _data);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override isBlackListWallet(from) isBlackListWallet(to) {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
}
