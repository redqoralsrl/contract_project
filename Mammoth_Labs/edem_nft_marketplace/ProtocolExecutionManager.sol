// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import {IProtocolExecutionManager} from "./interfaces/IProtocolExecutionManager.sol";

contract ProtocolExecutionManager is IProtocolExecutionManager, Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _whitelistedProtocols;

    event ProtocolDelete(address indexed protocol);
    event ProtocolWhitelisted(address indexed protocol);

    // ProtocolAndExecution 주소 추가하기
    function addProtocol(address protocol) external override onlyOwner {
        require(
            !_whitelistedProtocols.contains(protocol),
            "Protocol: Already Whitelisted!"
        );

        _whitelistedProtocols.add(protocol);

        emit ProtocolWhitelisted(protocol);
    }

    // ProtocolAndExecution 주소 삭제하기
    function removeProtocol(address protocol) external override onlyOwner {
        require(
            !_whitelistedProtocols.contains(protocol),
            "Protocol: Not Existed"
        );

        _whitelistedProtocols.remove(protocol);

        emit ProtocolDelete(protocol);
    }

    // ProtocolAndExecution 주소 조회하기
    function isProtocolWhitelisted(
        address protocol
    ) external view override returns (bool) {
        return _whitelistedProtocols.contains(protocol);
    }

    // Protocol 허가된 주소 리스트로 모아서 보기
    function viewWhitelistedProtocol(
        uint256 cursor,
        uint256 size
    ) external view override returns (address[] memory, uint256) {
        uint256 len = size;

        if (len > _whitelistedProtocols.length() - cursor) {
            len = _whitelistedProtocols.length() - cursor;
        }

        address[] memory whitelistedProtocols = new address[](len);

        for (uint256 i = 0; i < len; i++) {
            whitelistedProtocols[i] = _whitelistedProtocols.at(cursor + i);
        }

        return (whitelistedProtocols, cursor + len);
    }

    // Protocol 허가된 주소 길이 보기
    function viewCountWhitelistedProtocol()
        external
        view
        override
        returns (uint256)
    {
        return _whitelistedProtocols.length();
    }
}
