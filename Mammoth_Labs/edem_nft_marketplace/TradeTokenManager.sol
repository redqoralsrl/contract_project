// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {ITradeTokenManager} from "./interfaces/ITradeTokenManager.sol";

contract TradeTokenManager is ITradeTokenManager, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _whitelistedTokens;

    event TokenDelete(address indexed token);
    event TokenWhitelisted(address indexed token);

    // 지원하는 erc-20 주소 추가
    function addToken(address token) external override onlyOwner {
        require(
            !_whitelistedTokens.contains(token),
            "Token: Already Token Address"
        );

        _whitelistedTokens.add(token);

        emit TokenWhitelisted(token);
    }

    // 지원하는 erc-20 주소 삭제
    function removeToken(address token) external override onlyOwner {
        require(_whitelistedTokens.contains(token), "Token: Not Existed");

        _whitelistedTokens.remove(token);

        emit TokenDelete(token);
    }

    // 지원하는 erc-20 주소 조회
    function isTokenWhitelisted(
        address token
    ) external view override returns (bool) {
        return _whitelistedTokens.contains(token);
    }

    // 지원하는 erc-20 주소 리스트로 모아서 보기
    function viewWhitelistedToken(
        uint256 cursor,
        uint256 size
    ) external view override returns (address[] memory, uint256) {
        uint256 len = size;

        if (len > _whitelistedTokens.length() - cursor) {
            len = _whitelistedTokens.length() - cursor;
        }

        address[] memory whitelistedTokens = new address[](len);

        for (uint256 i = 0; i < len; i++) {
            whitelistedTokens[i] = _whitelistedTokens.at(cursor + i);
        }

        return (whitelistedTokens, cursor + len);
    }

    // 지원하는 erc-20 주소 길이 보기
    function viewCountWhitelistedToken()
        external
        view
        override
        returns (uint256)
    {
        return _whitelistedTokens.length();
    }
}
