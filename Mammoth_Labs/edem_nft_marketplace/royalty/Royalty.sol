// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IRoyalty} from "../interfaces/IRoyalty.sol";

contract Royalty is IRoyalty, Ownable {
    struct FeeInfo {
        address setter;
        address receiver;
        uint256 fee;
    }
    // 로열티 수수료 제한 (10,000 = 100%, 500 = 5%, 1,000 = 10%)
    uint256 public royaltyFeeLimit;

    mapping(address => FeeInfo) private _royaltyFeeInfoCollection;

    event NewRoyaltyFeeLimit(uint256 royaltyFeeLimit);
    event RoyaltyFeeUpdate(
        address indexed collection,
        address indexed setter,
        address indexed receiver,
        uint256 fee
    );

    constructor(uint256 _royaltyFeeLimit) {
        royaltyFeeLimit = _royaltyFeeLimit;

        emit NewRoyaltyFeeLimit(_royaltyFeeLimit);
    }

    // 로열티 수수료 제한 범위 업데이트
    function updateRoyaltyFeeLimit(
        uint256 _royaltyFeeLimit
    ) external override onlyOwner {
        royaltyFeeLimit = _royaltyFeeLimit;

        emit NewRoyaltyFeeLimit(_royaltyFeeLimit);
    }

    // 해당 NFT의 로열티 설정
    function updateRoyaltyInfo(
        address collection,
        address setter,
        address receiver,
        uint256 fee
    ) external override onlyOwner {
        require(fee <= royaltyFeeLimit, "Royalty: fee too high");

        _royaltyFeeInfoCollection[collection] = FeeInfo({
            setter: setter,
            receiver: receiver,
            fee: fee
        });

        emit RoyaltyFeeUpdate(collection, setter, receiver, fee);
    }

    // NFT 거래서 해당 금액에서 빠질 로열티 가격 정보 반환
    function royaltyInfo(
        address collection,
        uint256 amount
    ) external view override returns (address, uint256) {
        return (
            _royaltyFeeInfoCollection[collection].receiver,
            (amount * _royaltyFeeInfoCollection[collection].fee) / 10000
        );
    }

    // NFT의 로열티 정보 반환
    function royaltyInfoCollection(
        address collection
    ) external view override returns (address, address, uint256) {
        return (
            _royaltyFeeInfoCollection[collection].setter,
            _royaltyFeeInfoCollection[collection].receiver,
            _royaltyFeeInfoCollection[collection].fee
        );
    }
}
