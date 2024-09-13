// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

interface ICFNAccessControl {
    // Events
    event WhiteListWalletAdded(address addr);
    event WhiteListWalletRemoved(address addr);
    event BlackListWalletAdded(address addr);
    event BlackListWalletRemoved(address addr);

    event WhiteListControlAdded(address con);
    event WhiteListControlRemoved(address con);
    event BlackListControlAdded(address con);
    event BlackListControlRemoved(address con);

    // Getters for mappings
    function whiteListWallet(address _addr) external view returns (bool);

    function blackListWallet(address _addr) external view returns (bool);

    function whiteListControlAddress(
        address _addr
    ) external view returns (bool);

    function blackListControlAddress(
        address _addr
    ) external view returns (bool);

    // Wallet Functions
    function addWhiteListWallet(address _addr) external returns (bool success);

    function removeWhiteListWallet(
        address _addr
    ) external returns (bool success);

    function addBlackListWallet(address _addr) external returns (bool success);

    function removeBlackListWallet(
        address _addr
    ) external returns (bool success);

    // Admin Functions
    function addWhiteListControl(address _addr) external returns (bool success);

    function removeWhiteListControl(
        address _addr
    ) external returns (bool success);

    function addBlackListControl(address _addr) external returns (bool success);

    function removeBlackListControl(
        address _addr
    ) external returns (bool success);
}
