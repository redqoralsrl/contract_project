// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

import {ITradeTokenManager} from "./interfaces/ITradeTokenManager.sol";
import {IProtocolExecutionManager} from "./interfaces/IProtocolExecutionManager.sol";
import {IProtocolAndExecution} from "./interfaces/IProtocolAndExecution.sol";
import {IRoyaltyManager} from "./interfaces/IRoyaltyManager.sol";
import {IEdem} from "./interfaces/IEdem.sol";
import {ITransferExecution} from "./interfaces/ITransferExecution.sol";
import {ITransferManager} from "./interfaces/ITransferManager.sol";
import {IWETH} from "./interfaces/IWETH.sol";

import {MarketTypes} from "./libraries/MarketTypes.sol";
import {SignHashChecker} from "./libraries/SignHashChecker.sol";

/**
 
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⣿⣿⡇⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⡟⠟⠛⠛⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣶⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠟⠉⠉⠙⠉⠉⢹⣿⣗⠒⠲⠶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⠿⠛⠛⠛⠛⠛⠻⢿⣿⣿⣿⣿⣿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠀⠀⠀⠈⠙⣿⣿⣿⣿⣿⡿⠟⠛⠛⠛⠛⠛⢿⣿⣿⣿⣿⣿⠿⠿⠿⠿⣿⠟⠛⠛⠛⠛⠻⣿⣿⣿⣿⠿⠛⠛⠛⠛⠻⢿⣿⣿
    ⣿⡿⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠰⣿⣿⣿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣿⣿⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠈⠛⠛⠁⠀⠀⠀⠀⠀⠀⠀⠙⢿
    ⠟⠀⠀⠀⢠⣴⣶⣿⣷⣦⣤⠀⠀⠀⠸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠠⣿⡿⠃⠀⠀⢀⣤⣶⣾⣿⣶⣤⡄⠀⠀⠀⢻⣿⠀⠀⠀⠀⠀⣠⣶⣶⣶⣄⠀⠀⠀⠀⠀⣠⣴⣶⣶⣤⡀⠀⠀⠀
    ⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣦⠀⠀⠀⢹⣿⡀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠘⣿⠀⠀⠀⠀⣼⣿⣿⣿⣿⣿⡆⠀⠀⠀⢠⣿⣿⣿⣿⣿⡇⠀⠀⠀
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣧⠀⠀⠀⣾⣿⣿⣿⣿⣿⣿⠀⠀⠀
    ⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣸⣿⣶⣶⣶⠖⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢶⣶⣶⣮⣿⡇⠀⠀⠀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣿⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
    ⡀⠀⠀⠘⢿⣿⣿⣿⣿⣿⣿⠟⠛⠛⠛⣿⣿⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣇⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⡿⠛⠛⠛⢻⣿⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
    ⣷⡀⠀⠀⠀⠈⠛⠻⠟⠋⠁⠀⠀⠀⣸⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣆⠀⠀⠀⠀⠙⠛⠟⠛⠉⠀⠀⠀⢀⣼⣿⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀
    ⣿⣿⣦⣄⠀⠀⠀⠀⠀⠀⠀⢀⣠⣾⣿⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣿⣿⣿⡀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀

 */

contract Edem is IEdem, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    using MarketTypes for MarketTypes.MarketPlace;
    using MarketTypes for MarketTypes.User;

    address public immutable WETH;
    bytes32 public immutable DOMAIN_SEPARATOR;

    // ERC721 interfaceID
    bytes4 public constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    // ERC1155 interfaceID
    bytes4 public constant INTERFACE_ID_ERC1155 = 0xd9b67a26;

    address public protocoleFeeRecipient;

    ITradeTokenManager public tradeTokenManager;
    IProtocolExecutionManager public protocolExecutionManager;
    IRoyaltyManager public royaltyManager;
    ITransferManager public transferManager;

    mapping(address => uint256) userOrderNonce;
    mapping(address => mapping(uint256 => bool))
        private _isUserOrderNonceExecutedOrCancelled;

    event CancelAllOrders(address indexed user, uint256 newMinNonce);
    event CancelMultipleOrders(address indexed user, uint256[] orderNonces);
    event NewTradeTokenManager(address indexed tradeTokenManager);
    event NewProtocolExecutionManager(address indexed protocolExecutionManager);
    event NewProtocolFeeRecipient(address indexed protocoleFeeRecipient);
    event NewRoyaltyManager(address indexed royaltyManager);
    event NewTransferManager(address indexed transferManager);

    event RoyaltyPayment(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed royaltyRecipient,
        address currency,
        uint256 amount
    );

    event UserSeller(
        bytes32 marketPlaceHash,
        uint256 orderNonce,
        address indexed userSeller,
        address indexed marketProposer,
        address indexed protocolAddress,
        address tradeTokenAddress,
        address collection,
        uint256 tokenId,
        uint256 nftAmount,
        uint256 price
    );

    event UserProposer(
        bytes32 marketPlaceHash,
        uint256 orderNonce,
        address indexed userProposer,
        address indexed marketSeller,
        address indexed protocolAddress,
        address tradeTokenAddress,
        address collection,
        uint256 tokenId,
        uint256 amount,
        uint256 price
    );

    constructor(
        address _tradeTokenManager,
        address _protocolExecutionManager,
        address _royaltyManager,
        address _transferManager,
        address _WETH,
        address _protocolFeeRecipient
    ) {
        uint chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("Edem")),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
        tradeTokenManager = ITradeTokenManager(_tradeTokenManager);
        protocolExecutionManager = IProtocolExecutionManager(
            _protocolExecutionManager
        );
        royaltyManager = IRoyaltyManager(_royaltyManager);
        transferManager = ITransferManager(_transferManager);
        WETH = _WETH;
        protocoleFeeRecipient = _protocolFeeRecipient;
    }

    /**
     *
     * 해당 사용자의 주문 혹은 제안 조회
     *
     */
    function isUserOrderNonceExecutedOrCancelled(
        address user,
        uint256 orderNonces
    ) external view returns (bool) {
        return _isUserOrderNonceExecutedOrCancelled[user][orderNonces];
    }

    /**
     *
     * Proxy Patterns Contract Update 하는 구간
     * https://blog.openzeppelin.com/proxy-patterns/
     *
     */
    // tokenManager proxy 주소 업데이트
    function updateTradeTokenManager(
        address _tradeTokenManager
    ) external onlyOwner {
        require(_tradeTokenManager != address(0), "Cannot be null address");
        tradeTokenManager = ITradeTokenManager(_tradeTokenManager);
        emit NewTradeTokenManager(_tradeTokenManager);
    }

    // protocolExecutionManager proxy 주소 업데이트
    function updateProtocolExecutionManager(
        address _protocolExecutionManager
    ) external onlyOwner {
        require(
            _protocolExecutionManager != address(0),
            "Cannot be null address"
        );
        protocolExecutionManager = IProtocolExecutionManager(
            _protocolExecutionManager
        );
        emit NewProtocolExecutionManager(_protocolExecutionManager);
    }

    // royaltyManager proxy 주소 업데이트
    function updateRoyaltyManager(address _royaltyManager) external onlyOwner {
        require(_royaltyManager != address(0), "Cannot be null address");
        royaltyManager = IRoyaltyManager(_royaltyManager);
        emit NewRoyaltyManager(_royaltyManager);
    }

    // transferManager proxy 주소 업데이트
    function updateTransferManager(
        address _transferManager
    ) external onlyOwner {
        require(_transferManager != address(0), "Cannot be null address");
        transferManager = ITransferManager(_transferManager);
        emit NewTransferManager(_transferManager);
    }

    /**
     *
     * NFT 단일 / 다중 취소
     *
     */
    function cancelAll(uint256 minNonce) external {
        require(minNonce > userOrderNonce[msg.sender], "");
        require(minNonce < userOrderNonce[msg.sender] + 500000, "");
        userOrderNonce[msg.sender] = minNonce;

        emit CancelAllOrders(msg.sender, minNonce);
    }

    // NFT 판매 / 제안 일괄 취소
    function cancelSellAndSuggest(uint256[] calldata orderNonces) external {
        require(orderNonces.length > 0, "At least one is required.");

        for (uint256 i = 0; i < orderNonces.length; i++) {
            require(
                orderNonces[i] >= userOrderNonce[msg.sender],
                "Nonce lower than current"
            );
            _isUserOrderNonceExecutedOrCancelled[msg.sender][
                orderNonces[i]
            ] = true;
        }

        emit CancelMultipleOrders(msg.sender, orderNonces);
    }

    // NFT 판매를 사려고 하는 사람들이 구매할 때 사용하는 함수
    function proposerPayETH(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external payable override nonReentrant {
        require(
            (marketSeller.isDealer) && (!userProposer.isDealer),
            "That is the wrong approach."
        );
        require(
            msg.sender == userProposer.takerAddress,
            "Client must be sender"
        );
        require(userProposer.price == msg.value, "Too High / Low Coin");

        bytes32 hashData = marketSeller.hash();
        _marketOrderValidation(marketSeller, hashData);

        (bool isValid, uint256 tokenId, uint256 amount) = IProtocolAndExecution(
            marketSeller.protocolAddress
        ).possiblePurchase(userProposer, marketSeller);

        require(isValid, "Invalid Trade Nft");

        _isUserOrderNonceExecutedOrCancelled[marketSeller.edemSigner][
            marketSeller.nonce
        ] = true;

        _transferFeesAndRoyaltyWithETH(
            marketSeller.protocolAddress,
            marketSeller.collection,
            tokenId,
            marketSeller.edemSigner,
            userProposer.price
        );

        _transferNft(
            marketSeller.collection,
            marketSeller.edemSigner,
            userProposer.takerAddress,
            tokenId,
            amount
        );

        emit UserProposer(
            hashData,
            marketSeller.nonce,
            userProposer.takerAddress,
            marketSeller.edemSigner,
            marketSeller.protocolAddress,
            marketSeller.tradeTokenAddress,
            marketSeller.collection,
            tokenId,
            amount,
            userProposer.price
        );
    }

    /**
     *
     * NFT 구매
     *
     */
    // NFT 판매를 사려고 하는 사람들이 구매할 때 사용하는 함수
    // ETH와 WETH를 선택하거나 ETH로 선택한 경우 작동
    function proposerPayETHAndWETH(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external payable override nonReentrant {
        require(
            (marketSeller.isDealer) && (!userProposer.isDealer),
            "That is the wrong approach."
        );
        require(marketSeller.tradeTokenAddress == WETH, "Unsupported token.");
        require(
            msg.sender == userProposer.takerAddress,
            "Client must be sender"
        );

        if (userProposer.price > msg.value) {
            IERC20(WETH).safeTransferFrom(
                msg.sender,
                address(this),
                (userProposer.price - msg.value)
            );
        } else {
            require(userProposer.price == msg.value, "Too High Coin");
        }

        IWETH(WETH).deposit{value: msg.value}();

        bytes32 hashData = marketSeller.hash();
        _marketOrderValidation(marketSeller, hashData);

        (bool isValid, uint256 tokenId, uint256 amount) = IProtocolAndExecution(
            marketSeller.protocolAddress
        ).possiblePurchase(userProposer, marketSeller);

        require(isValid, "Invalid Trade Nft");

        _isUserOrderNonceExecutedOrCancelled[marketSeller.edemSigner][
            marketSeller.nonce
        ] = true;

        _transferFeesAndRoyaltyWithWETH(
            marketSeller.protocolAddress,
            marketSeller.collection,
            tokenId,
            marketSeller.edemSigner,
            userProposer.price
        );

        _transferNft(
            marketSeller.collection,
            marketSeller.edemSigner,
            userProposer.takerAddress,
            tokenId,
            amount
        );

        emit UserProposer(
            hashData,
            marketSeller.nonce,
            userProposer.takerAddress,
            marketSeller.edemSigner,
            marketSeller.protocolAddress,
            marketSeller.tradeTokenAddress,
            marketSeller.collection,
            tokenId,
            amount,
            userProposer.price
        );
    }

    // NFT 판매목록을 사람들이 구매할 때 사용하는 함수
    // WETH만으로 거래하는 함수 (WETH가 충분한지)
    function proposerPay(
        MarketTypes.User calldata userProposer,
        MarketTypes.MarketPlace calldata marketSeller
    ) external override nonReentrant {
        require(
            (marketSeller.isDealer) && (!userProposer.isDealer),
            "That is the wrong approach."
        );
        require(msg.sender == userProposer.takerAddress, "");

        bytes32 hashData = marketSeller.hash();
        _marketOrderValidation(marketSeller, hashData);

        (bool isValid, uint256 tokenId, uint256 amount) = IProtocolAndExecution(
            marketSeller.protocolAddress
        ).possiblePurchase(userProposer, marketSeller);

        require(isValid, "Invalid Trade Nft");

        _isUserOrderNonceExecutedOrCancelled[marketSeller.edemSigner][
            marketSeller.nonce
        ] = true;

        _transferFeesAndRoyalty(
            marketSeller.protocolAddress,
            marketSeller.collection,
            tokenId,
            marketSeller.tradeTokenAddress,
            msg.sender,
            marketSeller.edemSigner,
            userProposer.price
        );

        _transferNft(
            marketSeller.collection,
            marketSeller.edemSigner,
            userProposer.takerAddress,
            tokenId,
            amount
        );

        emit UserProposer(
            hashData,
            marketSeller.nonce,
            userProposer.takerAddress,
            marketSeller.edemSigner,
            marketSeller.protocolAddress,
            marketSeller.tradeTokenAddress,
            marketSeller.collection,
            tokenId,
            amount,
            userProposer.price
        );
    }

    // NFT 판매자가 제안을 승낙한 경우
    // WETH만으로 거래하는 함수 (WETH가 충분한지)
    function suggestApprove(
        MarketTypes.User calldata userSeller,
        MarketTypes.MarketPlace calldata marketProposer
    ) external override nonReentrant {
        require(
            (!marketProposer.isDealer) && (userSeller.isDealer),
            "That is the wrong approach."
        );
        require(msg.sender == userSeller.takerAddress, "Taker must be sender");

        bytes32 hashData = marketProposer.hash();
        _marketOrderValidation(marketProposer, hashData);

        (bool isValid, uint256 tokenId, uint256 amount) = IProtocolAndExecution(
            marketProposer.protocolAddress
        ).possibleAcceptSuggest(userSeller, marketProposer);

        require(isValid, "Invalid Trade Nft");

        _isUserOrderNonceExecutedOrCancelled[marketProposer.edemSigner][
            marketProposer.nonce
        ] = true;

        _transferNft(
            marketProposer.collection,
            msg.sender,
            marketProposer.edemSigner,
            tokenId,
            amount
        );

        _transferFeesAndRoyalty(
            marketProposer.protocolAddress,
            marketProposer.collection,
            tokenId,
            marketProposer.tradeTokenAddress,
            marketProposer.edemSigner,
            userSeller.takerAddress,
            userSeller.price
        );

        emit UserSeller(
            hashData,
            marketProposer.nonce,
            userSeller.takerAddress,
            marketProposer.edemSigner,
            marketProposer.protocolAddress,
            marketProposer.tradeTokenAddress,
            marketProposer.collection,
            tokenId,
            amount,
            userSeller.price
        );
    }

    /**
     *
     * NFT 필수 정의 함수
     *
     */
    // 서명을 통한 거래가 유효한지
    function _marketOrderValidation(
        MarketTypes.MarketPlace calldata marketPlace,
        bytes32 hashData
    ) internal view {
        require(
            !_isUserOrderNonceExecutedOrCancelled[marketPlace.edemSigner][
                marketPlace.nonce
            ] && (marketPlace.nonce >= userOrderNonce[marketPlace.edemSigner]),
            "Edem singer not valid or expired"
        );

        require(marketPlace.edemSigner != address(0), "Invalid signer");

        require(marketPlace.nftAmount > 0, "Nft amount must be 1 or +");

        require(
            SignHashChecker.verify(
                hashData,
                marketPlace.edemSigner,
                marketPlace.v,
                marketPlace.r,
                marketPlace.s,
                DOMAIN_SEPARATOR
            ),
            "SignHash Invalid to verify!"
        );

        require(
            tradeTokenManager.isTokenWhitelisted(marketPlace.tradeTokenAddress),
            "Not authorized."
        );

        require(
            protocolExecutionManager.isProtocolWhitelisted(
                marketPlace.protocolAddress
            ),
            "Not authorized."
        );
    }

    // 프르토콜 수수료 계산
    function _calculateProtocolFee(
        address protocol,
        uint256 amount
    ) internal view returns (uint256) {
        uint256 protocolFee = IProtocolAndExecution(protocol).viewProtocolFee();
        return (protocolFee * amount) / 10000;
    }

    // 프로토콜 수수료 떼 로열티 떼고 나머지 전송 - ETH 전용
    function _transferFeesAndRoyaltyWithETH(
        address protocol,
        address collection,
        uint256 tokenId,
        address to,
        uint256 amount
    ) internal {
        uint256 finalAmount = amount;

        // EDEM 프로토콜 수수료 제거
        {
            uint256 protocolFee = _calculateProtocolFee(protocol, amount);
            if ((protocoleFeeRecipient != address(0)) && (protocolFee != 0)) {
                EthTransfer(protocoleFeeRecipient, protocolFee, finalAmount);
                finalAmount -= protocolFee;
            }
        }
        // Royalty 수수료 제거
        {
            (
                address royaltyRecipient,
                uint256 royaltyFeeAmount
            ) = royaltyManager.recipientWithroyaltyDeductionAmount(
                    collection,
                    tokenId,
                    amount
                );
            if ((royaltyRecipient != address(0) && (royaltyFeeAmount != 0))) {
                EthTransfer(royaltyRecipient, royaltyFeeAmount, finalAmount);
                finalAmount -= royaltyFeeAmount;

                emit RoyaltyPayment(
                    collection,
                    tokenId,
                    royaltyRecipient,
                    address(this),
                    royaltyFeeAmount
                );
            }
        }

        require(finalAmount > 0, "The fee is too high to charge anything.");

        // 판매자에게 전송
        {
            EthTransfer(to, finalAmount, finalAmount);
        }
    }

    function EthTransfer(
        address _to,
        uint256 _amount,
        uint256 _finalAmount
    ) internal {
        require(_finalAmount >= _amount, "transfer: balance is not enough");
        //address(this).sendValue(address(_to), _amount);
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "transfer: unable to send value");
    }

    // 프로토콜 수수료 떼고 로열티 떼고 나머지 전송 - WETH / ETH 전용
    function _transferFeesAndRoyaltyWithWETH(
        address protocol,
        address collection,
        uint256 tokenId,
        address to,
        uint256 amount
    ) internal {
        uint256 finalAmount = amount;

        // Edem 프로토콜 수수료 제거
        {
            uint256 protocolFee = _calculateProtocolFee(protocol, amount);
            if ((protocoleFeeRecipient != address(0)) && (protocolFee != 0)) {
                IERC20(WETH).safeTransfer(protocoleFeeRecipient, protocolFee);
                finalAmount -= protocolFee;
            }
        }
        // Royalty 수수료 제거
        {
            (
                address royaltyRecipient,
                uint256 royaltyFeeAmount
            ) = royaltyManager.recipientWithroyaltyDeductionAmount(
                    collection,
                    tokenId,
                    amount
                );
            if ((royaltyRecipient != address(0) && (royaltyFeeAmount != 0))) {
                IERC20(WETH).safeTransfer(royaltyRecipient, royaltyFeeAmount);
                finalAmount -= royaltyFeeAmount;

                emit RoyaltyPayment(
                    collection,
                    tokenId,
                    royaltyRecipient,
                    address(WETH),
                    royaltyFeeAmount
                );
            }
        }

        require(finalAmount > 0, "The fee is too high to charge anything.");

        // 판매자에게 전송
        {
            IERC20(WETH).safeTransfer(to, finalAmount);
        }
    }

    // 프로토콜 수수료 떼고 로열티 떼고 나머지 전송
    function _transferFeesAndRoyalty(
        address protocol,
        address collection,
        uint256 tokenId,
        address tradeTokenAddress,
        address from,
        address to,
        uint256 amount
    ) internal {
        uint256 finalAmount = amount;

        // Edem 프로토콜 수수료 제거
        {
            uint256 protocolFee = _calculateProtocolFee(protocol, amount);
            if ((protocoleFeeRecipient != address(0)) && (protocolFee != 0)) {
                IERC20(tradeTokenAddress).safeTransferFrom(
                    from,
                    protocoleFeeRecipient,
                    protocolFee
                );
                finalAmount -= protocolFee;
            }
        }
        // Royalty 수수료 제거
        {
            (
                address royaltyRecipient,
                uint256 royaltyFeeAmount
            ) = royaltyManager.recipientWithroyaltyDeductionAmount(
                    collection,
                    tokenId,
                    amount
                );
            if ((royaltyRecipient != address(0)) && (royaltyFeeAmount != 0)) {
                IERC20(tradeTokenAddress).safeTransferFrom(
                    from,
                    royaltyRecipient,
                    royaltyFeeAmount
                );
                finalAmount -= royaltyFeeAmount;

                emit RoyaltyPayment(
                    collection,
                    tokenId,
                    royaltyRecipient,
                    tradeTokenAddress,
                    royaltyFeeAmount
                );
            }
        }

        require(finalAmount > 0, "The fee is too high to charge anything.");

        // 판매자에게 전송
        {
            IERC20(tradeTokenAddress).safeTransferFrom(from, to, finalAmount);
        }
    }

    // NFT 전송 하기
    function _transferNft(
        address collection,
        address from,
        address to,
        uint256 tokenId,
        uint256 nftAmount
    ) internal {
        address transferAddress = transferManager.transferManagerAddress(
            collection
        );

        require(transferAddress != address(0), "Requires registration");

        ITransferExecution(transferAddress).transferFrom(
            collection,
            from,
            to,
            tokenId,
            nftAmount
        );
    }
}
