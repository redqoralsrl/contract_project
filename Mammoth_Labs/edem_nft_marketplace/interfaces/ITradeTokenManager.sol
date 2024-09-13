// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITradeTokenManager {
    function addToken(address token) external;

    function removeToken(address token) external;

    function isTokenWhitelisted(address token) external view returns (bool);

    function viewWhitelistedToken(
        uint256 cursor,
        uint256 size
    ) external view returns (address[] memory, uint256);

    function viewCountWhitelistedToken() external view returns (uint256);
}
