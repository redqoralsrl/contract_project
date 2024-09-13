// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITransferManager {
    function transferManagerAddress(
        address collection
    ) external view returns (address);
}
