// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../libraries/ItemTypes.sol";

interface IChickItem is IERC1155 {
    struct ChickItem {
        uint256 tokenId;
        bool isPulletPossible;
        bool isSale;
        uint256 price;
        uint256 day;
        uint256 statsIndex;
    }

    function setAccessControl(address _ca) external;

    function setURI(string memory _newUri) external;

    function addItems(ItemTypes.ChickItem calldata item) external;

    function setIsPulletPossible(
        uint256 _tokenId,
        bool _isPulletPossible
    ) external;

    function setIsSaleItem(uint256 _tokenId, bool _isSale) external;

    function setPriceItem(uint256 _tokenId, uint256 _price) external;

    function setDayItem(uint256 _tokenId, uint256 _day) external;

    function getItemList() external view returns (uint256[] memory);

    function uri(uint256 tokenId) external view returns (string memory);

    function burn(address account, uint256 id, uint256 value) external;

    function mint(
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes memory _data
    ) external;

    function mintBatch(
        address _to,
        uint256[] memory _ids,
        uint256[] memory _amounts,
        bytes memory _data
    ) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external override;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external override;

    function tokenURIs(
        uint256 tokenId
    ) external view returns (ItemTypes.ChickItem memory);
}
