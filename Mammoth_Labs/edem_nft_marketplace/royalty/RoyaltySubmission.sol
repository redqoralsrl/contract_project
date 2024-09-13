// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IRoyalty} from "../interfaces/IRoyalty.sol";
import {IOwnable} from "../interfaces/IOwnable.sol";

contract RoyaltySubmission is Ownable {
    // ERC721 interfaceID
    bytes4 public constant INTERFACE_ID_ERC721 = 0x80ac58cd;

    // ERC1155 interfaceID
    bytes4 public constant INTERFACE_ID_ERC1155 = 0xd9b67a26;

    // ERC2981 interfaceID
    bytes4 public constant INTERFACE_ID_ERC2981 = 0x2a55205a;

    // Royalty.sol의 계약 주소
    address public immutable royalty;

    constructor(address _royalty) {
        royalty = _royalty;
    }

    // Royalty.sol의 owner 변경
    function updateOwnerOfRoyalty(address _owner) external onlyOwner {
        IOwnable(royalty).transferOwnership(_owner);
    }

    // Royalty.sol의 로열티 Fee 제한 변경
    function updateRoyaltyFeeLimit(
        uint256 _royaltyFeeLimit
    ) external onlyOwner {
        IRoyalty(royalty).updateRoyaltyFeeLimit(_royaltyFeeLimit);
    }

    // 관리자가 직접 NFT 로열티를 등록해주는 함수
    function updateRoyaltyInfo(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) external onlyOwner {
        IRoyalty(royalty).updateRoyaltyInfo(collection, setter, receiver, fee);
    }

    // 해당 컨트랙트의 admin이면 실행
    function updateRoyaltyIfAdmin(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) external {
        require(
            !IERC165(collection).supportsInterface(INTERFACE_ID_ERC2981),
            "Already Supported"
        );
        require(msg.sender == IOwnable(collection).admin(), "Not Admin");

        _updateRoyaltyInfoIfOwnerOrAdmin(collection, setter, receiver, fee);
    }

    // 해당 컨트랙트의 owner이면 실행
    function updateRoyaltyIfOwner(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) external {
        require(
            !IERC165(collection).supportsInterface(INTERFACE_ID_ERC2981),
            "Already Supported"
        );
        require(msg.sender == IOwnable(collection).owner(), "Not Owner");

        _updateRoyaltyInfoIfOwnerOrAdmin(collection, setter, receiver, fee);
    }

    // 로열티를 이미 등록했지만 로열티 수수료를 바꿀 경우
    function updateRoyaltyIfSetter(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) external {
        (address currentSetter, , ) = IRoyalty(royalty).royaltyInfoCollection(
            collection
        );

        require(msg.sender == currentSetter, "Not the Setter");

        IRoyalty(royalty).updateRoyaltyInfo(collection, setter, receiver, fee);
    }

    /**
     * 0 => 이미 Edem에 등록된 로열티 contractAddress 등록할 필요가 없음
     * 1 => 해당 NFT 컨트랙트는 royalty를 지원하고 있음
     * 2 => 해당 컨트랙트 주소의 owner 주소를 반환
     * 3 => 해당 컨트랙트 주소의 admin 주소를 반환
     * 4 => 해당 컨트랙트 주인이 아님
     */
    function checkForCollectionSubmission(
        address collection
    ) external view returns (address, uint8) {
        (address currentSetter, , ) = IRoyalty(royalty).royaltyInfoCollection(
            collection
        );

        if (currentSetter != address(0)) {
            return (currentSetter, 0);
        }

        try
            IERC165(collection).supportsInterface(INTERFACE_ID_ERC2981)
        returns (bool interfaceSupport) {
            if (interfaceSupport) {
                return (address(0), 1);
            }
        } catch {}

        try IOwnable(collection).owner() returns (address setter) {
            return (setter, 2);
        } catch {
            try IOwnable(collection).admin() returns (address setter) {
                return (setter, 3);
            } catch {
                return (address(0), 4);
            }
        }
    }

    // NFT collection의 로열티를 등록하는 곳
    function _updateRoyaltyInfoIfOwnerOrAdmin(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) internal {
        (address currentSetter, , ) = IRoyalty(royalty).royaltyInfoCollection(
            collection
        );
        require(currentSetter == address(0), "Already Regist collection");

        require(
            (IERC165(collection).supportsInterface(INTERFACE_ID_ERC721) ||
                IERC165(collection).supportsInterface(INTERFACE_ID_ERC1155)),
            "This collection is not ERC721/ERC1155"
        );

        IRoyalty(royalty).updateRoyaltyInfo(collection, setter, receiver, fee);
    }
}
