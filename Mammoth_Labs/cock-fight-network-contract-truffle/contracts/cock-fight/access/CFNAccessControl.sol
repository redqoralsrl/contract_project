// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CFNAccessControl is Ownable {
    // mapping
    // wallet control
    mapping(address => bool) public whiteListWallet;
    mapping(address => bool) public blackListWallet;
    // admin control
    mapping(address => bool) public whiteListControlAddress;
    mapping(address => bool) public blackListControlAddress;

    // event
    // wallet event
    event WhiteListWalletAdded(address addr);
    event WhiteListWalletRemoved(address addr);
    event BlackListWalletAdded(address addr);
    event BlackListWalletRemoved(address addr);
    // admin event
    event WhiteListControlAdded(address con);
    event WhiteListControlRemoved(address con);
    event BlackListControlAdded(address con);
    event BlackListControlRemoved(address con);

    constructor() {
        addWhiteListWallet(msg.sender);
        addWhiteListControl(msg.sender);
    }

    // function
    // wallet function
    function addWhiteListWallet(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (!whiteListWallet[_addr]) {
            whiteListWallet[_addr] = true;
            emit WhiteListWalletAdded(_addr);
            success = true;
        }
    }

    function removeWhiteListWallet(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (whiteListWallet[_addr]) {
            whiteListWallet[_addr] = false;
            emit WhiteListWalletRemoved(_addr);
            success = true;
        }
    }

    function addBlackListWallet(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (!blackListWallet[_addr]) {
            blackListWallet[_addr] = true;
            emit BlackListWalletAdded(_addr);
            success = true;
        }
    }

    function removeBlackListWallet(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (blackListWallet[_addr]) {
            blackListWallet[_addr] = false;
            emit BlackListWalletRemoved(_addr);
            success = true;
        }
    }

    // admin function
    function addWhiteListControl(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (!whiteListControlAddress[_addr]) {
            whiteListControlAddress[_addr] = true;
            emit WhiteListControlAdded(_addr);
            success = true;
        }
    }

    function removeWhiteListControl(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (whiteListControlAddress[_addr]) {
            whiteListControlAddress[_addr] = false;
            emit WhiteListControlRemoved(_addr);
            success = true;
        }
    }

    function addBlackListControl(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (!blackListControlAddress[_addr]) {
            blackListControlAddress[_addr] = true;
            emit BlackListControlAdded(_addr);
            success = true;
        }
    }

    function removeBlackListControl(
        address _addr
    ) public onlyOwner returns (bool success) {
        if (blackListControlAddress[_addr]) {
            blackListControlAddress[_addr] = false;
            emit BlackListControlRemoved(_addr);
            success = true;
        }
    }
}
