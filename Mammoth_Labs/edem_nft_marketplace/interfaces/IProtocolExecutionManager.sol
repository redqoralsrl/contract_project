// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProtocolExecutionManager {
    function addProtocol(address protocol) external;

    function removeProtocol(address protocol) external;

    function isProtocolWhitelisted(
        address protocol
    ) external view returns (bool);

    function viewWhitelistedProtocol(
        uint256 cursor,
        uint256 size
    ) external view returns (address[] memory, uint256);

    function viewCountWhitelistedProtocol() external view returns (uint256);
}
