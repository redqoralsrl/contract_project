// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {ITransferManager} from "./interfaces/ITransferManager.sol";

contract TransferManager is ITransferManager, Ownable {
    // ERC721 interfaceID
    bytes4 public constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    // ERC1155 interfaceID
    bytes4 public constant INTERFACE_ID_ERC1155 = 0xd9b67a26;

    address public immutable TRANSFER_MANAGER_ERC721;
    address public immutable TRANSFER_MANAGER_ERC1155;

    mapping(address => address) public transferManagerForCollection;

    event CollectionTransferManagerAdded(
        address indexed collection,
        address indexed transferManager
    );
    event CollectionTransferManagerRemoved(address indexed collection);

    constructor(address _transfer721, address _transfer1155) {
        TRANSFER_MANAGER_ERC721 = _transfer721;
        TRANSFER_MANAGER_ERC1155 = _transfer1155;
    }

    // 미지원되는 ERC721 NFT 전송 가능하게 Unsupported721 계약주소 추가하기
    function addTransferManagerCollection(
        address collection,
        address transferManager
    ) external onlyOwner {
        require(collection != address(0), "Collection null address");
        require(transferManager != address(0), "TransferManager null address");

        transferManagerForCollection[collection] = transferManager;

        emit CollectionTransferManagerAdded(collection, transferManager);
    }

    // 미지원되는 ERC1155 NFT 전송 가능하게 Unsupported721 계약주소 삭제하기
    function removeTransferManagerCollection(
        address collection
    ) external onlyOwner {
        require(
            transferManagerForCollection[collection] != address(0),
            "Collection null address"
        );

        transferManagerForCollection[collection] = address(0);

        emit CollectionTransferManagerRemoved(collection);
    }

    // ERC721 / ERC1155 / safeTransferFrom 없는 ERC721 에 따라서 NFT 전송 계약주소가 나뉨
    function transferManagerAddress(
        address collection
    ) external view override returns (address transferManager) {
        transferManager = transferManagerForCollection[collection];

        if (transferManager == address(0)) {
            if (IERC165(collection).supportsInterface(INTERFACE_ID_ERC721)) {
                transferManager = TRANSFER_MANAGER_ERC721;
            } else if (
                IERC165(collection).supportsInterface(INTERFACE_ID_ERC1155)
            ) {
                transferManager = TRANSFER_MANAGER_ERC1155;
            }
        }

        return transferManager;
    }
}
