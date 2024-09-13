// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

interface IOwnableWhiteList {
    function addAddressToWhitelist(address addr) external returns (bool);

    function addAddressesToWhitelist(
        address[] memory addrs
    ) external returns (bool);

    function removeAddressFromWhitelist(address addr) external returns (bool);

    function removeAddressesFromWhitelist(
        address[] memory addrs
    ) external returns (bool success);
}
