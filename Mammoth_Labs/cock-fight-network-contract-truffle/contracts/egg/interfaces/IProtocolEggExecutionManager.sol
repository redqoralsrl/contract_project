// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

interface IProtocolEggExecutionManager {
    // Functions
    function getEggPrice() external view returns (uint256);

    function updateEggContract(address _eggContract) external;

    function updateTokenContract(address _tokenContract) external;

    function updateReceiveWallet(address _receiveWallet) external;

    function updateEggPrice(uint256 _price) external;

    function withdrawAll() external;

    function withdraw(uint256 _amount) external;

    function singleMint() external;

    function singleMintWithPartner(address _partner) external;

    function batchMint(uint256 numberOfTokens) external;

    function batchMintWithPartner(
        address _partner,
        uint256 numberOfTokens
    ) external;
}
