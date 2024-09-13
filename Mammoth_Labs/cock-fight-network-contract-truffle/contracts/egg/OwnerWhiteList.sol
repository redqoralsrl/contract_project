// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IOwnerWhiteList.sol";

contract OwnerWhiteList is Ownable, IOwnableWhiteList {
    mapping(address => bool) public whitelist;

    event WhitelistedAddressAdded(address addr);
    event WhitelistedAddressRemoved(address addr);

    constructor() {
        addAddressToWhitelist(msg.sender);
    }

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender]);
        _;
    }

    function addAddressToWhitelist(
        address addr
    ) public override onlyOwner returns (bool success) {
        if (!whitelist[addr]) {
            whitelist[addr] = true;
            emit WhitelistedAddressAdded(addr);
            success = true;
        }
    }

    function addAddressesToWhitelist(
        address[] memory addrs
    ) public override onlyOwner returns (bool success) {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (addAddressToWhitelist(addrs[i])) {
                success = true;
            }
        }
    }

    function removeAddressFromWhitelist(
        address addr
    ) public override onlyOwner returns (bool success) {
        if (whitelist[addr]) {
            whitelist[addr] = false;
            emit WhitelistedAddressRemoved(addr);
            success = true;
        }
    }

    function removeAddressesFromWhitelist(
        address[] memory addrs
    ) public override onlyOwner returns (bool success) {
        for (uint256 i = 0; i < addrs.length; i++) {
            if (removeAddressFromWhitelist(addrs[i])) {
                success = true;
            }
        }
    }
}
