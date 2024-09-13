// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "../libraries/ItemTypes.sol";

interface ICockItem is IERC1155 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function accessControl() external view returns (address);

    function setAccessControl(address _ca) external;

    function setURI(string memory _newUri) external;

    function tokenURIs(
        uint256 _tokenId
    ) external view returns (ItemTypes.CockItem memory);

    function addItems(ItemTypes.CockItem calldata item) external;

    function setIsSale(uint256 _tokenId, bool _isSale) external;

    function setPrice(uint256 _tokenId, uint256 _price) external;

    function setHealing(uint256 _tokenId, bool _healing) external;

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
}
