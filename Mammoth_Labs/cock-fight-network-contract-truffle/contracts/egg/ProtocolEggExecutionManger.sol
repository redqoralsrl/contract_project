// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IEgg} from "./interfaces/IEgg.sol";
import {IProtocolEggExecutionManager} from "./interfaces/IProtocolEggExecutionManager.sol";

contract ProtocolEggExecutionManger is
    ReentrancyGuard,
    Ownable,
    IProtocolEggExecutionManager
{
    using SafeERC20 for IERC20;

    event BuyEgg(address indexed buyer, uint256 price, uint256 counts);
    event BuyEggWithPartner(
        address indexed buyer,
        uint256 price,
        address indexed partner,
        uint256 counts
    );

    event NewEggContract(address indexed eggContract);
    event NewTokenContract(address indexed tokenContract);
    event NewReceiveWallet(address indexed receiveAddress);
    event NewPrice(uint256 price);

    event Withdraw(address indexed walletAddress, uint256 withdrawAmount);

    address receiveWallet;

    IEgg public eggManager;
    IERC20 public tokenManager;

    uint256 public eggPrice = 20000000000000000000; // 20 tokens

    constructor(
        address _receiveWallet,
        address _eggContract,
        address _tokenContract
    ) {
        require(_receiveWallet != address(0), "Cannot be null address.");
        require(_eggContract != address(0), "Cannot be null address.");
        require(_tokenContract != address(0), "Cannot be null address.");

        receiveWallet = _receiveWallet;
        eggManager = IEgg(_eggContract);
        tokenManager = IERC20(_tokenContract);
    }

    function getEggPrice() public view override returns (uint256) {
        return eggPrice;
    }

    function updateEggContract(address _eggContract) public override onlyOwner {
        require(_eggContract != address(0), "Cannot be null address.");

        eggManager = IEgg(_eggContract);

        emit NewEggContract(_eggContract);
    }

    function updateTokenContract(
        address _tokenContract
    ) public override onlyOwner {
        require(_tokenContract != address(0), "Cannot be null address.");

        tokenManager = IERC20(_tokenContract);

        emit NewTokenContract(_tokenContract);
    }

    function updateReceiveWallet(
        address _receiveWallet
    ) public override onlyOwner {
        require(_receiveWallet != address(0), "Cannot be null address.");

        receiveWallet = _receiveWallet;

        emit NewReceiveWallet(_receiveWallet);
    }

    function updateEggPrice(uint256 _price) public override onlyOwner {
        require(_price > 0, "Price must be greater than zero.");

        eggPrice = _price;

        emit NewPrice(_price);
    }

    function withdrawAll() public override onlyOwner {
        require(receiveWallet != address(0), "Cannot be null address.");

        uint256 tokenAmount = tokenManager.balanceOf(address(this));
        require(tokenAmount > 0, "Not enough token balance.");

        tokenManager.transfer(receiveWallet, tokenAmount);

        emit Withdraw(receiveWallet, tokenAmount);
    }

    function withdraw(uint256 _amount) public override onlyOwner {
        require(receiveWallet != address(0), "Cannot be null address.");

        uint256 tokenAmount = tokenManager.balanceOf(address(this));
        require(tokenAmount >= _amount, "Not enough token balance.");

        tokenManager.transfer(receiveWallet, _amount);

        emit Withdraw(receiveWallet, _amount);
    }

    function singleMint() public override nonReentrant {
        tokenManager.safeTransferFrom(msg.sender, address(this), eggPrice);

        eggManager.mint(msg.sender);

        emit BuyEgg(msg.sender, eggPrice, 1);
    }

    function singleMintWithPartner(
        address _partner
    ) public override nonReentrant {
        require(_partner != address(0), "Partner address cannot be null.");

        tokenManager.safeTransferFrom(msg.sender, address(this), eggPrice);

        eggManager.mint(msg.sender);

        emit BuyEggWithPartner(msg.sender, eggPrice, _partner, 1);
    }

    function batchMint(uint256 numberOfTokens) public override nonReentrant {
        require(numberOfTokens > 0, "Must be at least one.");

        tokenManager.safeTransferFrom(
            msg.sender,
            address(this),
            eggPrice * numberOfTokens
        );

        eggManager.batchMint(msg.sender, numberOfTokens);

        emit BuyEgg(msg.sender, eggPrice * numberOfTokens, numberOfTokens);
    }

    function batchMintWithPartner(
        address _partner,
        uint256 numberOfTokens
    ) public override nonReentrant {
        require(_partner != address(0), "Partner address cannot be null.");
        require(numberOfTokens > 0, "Must be at least one.");

        tokenManager.safeTransferFrom(
            msg.sender,
            address(this),
            eggPrice * numberOfTokens
        );

        eggManager.batchMint(msg.sender, numberOfTokens);

        emit BuyEggWithPartner(
            msg.sender,
            eggPrice * numberOfTokens,
            _partner,
            numberOfTokens
        );
    }
}
