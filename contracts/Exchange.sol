// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";
import {FlashLoanProvider} from "./FlashLoanProvider.sol";

contract Exchange is FlashLoanProvider {
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount; // defaulted to be zero when deployed

    mapping(address => mapping(address => uint256)) private userTotalTokenBalance;
    mapping(address => mapping(address => uint256)) private userActiveTokenBalance;

    mapping(uint256 => Order) public orders;
    mapping(uint256 => bool) public isOrderCancelled; // defaulted to be false when deployed
    mapping(uint256 => bool) public isOrderFilled; // defaulted to be false when deployed

    struct Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    event TokensDeposited(address indexed token, address indexed user, uint256 amount, uint256 balance);
    event TokensWithdrawn(address indexed token, address indexed user, uint256 amount, uint256 balance);
    event OrderCreated(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event OrderCancelled(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event OrderFilled(uint256 id, address maker, address taker, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositTokens(address _token, uint256 _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount), "Exchange: Token Transfer Failed");

        userTotalTokenBalance[_token][msg.sender] += _amount;

        emit TokensDeposited(_token, msg.sender, _amount, userTotalTokenBalance[_token][msg.sender]);
    }

    function withdrawTokens(address _token, uint256 _amount) public {
        require(totalBalanceOf(_token, msg.sender) - activeBalanceOf(_token, msg.sender) >= _amount, "Exchange: Insufficient Funds on Exchange");
        require(Token(_token).transfer(msg.sender, _amount), "Exchange: Token Transfer Failed");

        userTotalTokenBalance[_token][msg.sender] -= _amount;

        emit TokensWithdrawn(_token, msg.sender, _amount, userTotalTokenBalance[_token][msg.sender]);
    }

    function totalBalanceOf(address _token, address _user) public view returns (uint256){
        return userTotalTokenBalance[_token][_user];
    }

    function activeBalanceOf(address _token, address _user) public view returns (uint256){
        return userActiveTokenBalance[_token][_user];
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        require(totalBalanceOf(_tokenGive, msg.sender) >= activeBalanceOf(_tokenGive, msg.sender) + _amountGive, "Exchange: Insufficient Funds on Exchange");

        orderCount ++;
        orders[orderCount] = Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
        userActiveTokenBalance[_tokenGive][msg.sender] += _amountGive;

        emit OrderCreated(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        Order storage order = orders[_id];

        require(order.id == _id, "Exchange: Order Does Not Exist");
        require(address(order.user) == msg.sender, "Exchange: Not Your Order");
        require(!isOrderCancelled[_id], "Exchange: Order Has Been Cancelled");

        isOrderCancelled[_id] = true;
        userActiveTokenBalance[order.tokenGive][msg.sender] -= order.amountGive;

        emit OrderCancelled(_id, msg.sender, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, block.timestamp);
    }
    
    function _swapAndPayFee(uint256 _id, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        userTotalTokenBalance[_tokenGet][msg.sender] -= _amountGet;
        userTotalTokenBalance[_tokenGet][_user] += _amountGet;
        userTotalTokenBalance[_tokenGive][_user] -= _amountGive;
        userActiveTokenBalance[_tokenGive][_user] -= _amountGive; // also decreases active token balance of order maker
        userTotalTokenBalance[_tokenGive][msg.sender] += _amountGive;

        //Token(_tokenGet).transferFrom(address(this), feeAccount, _feeAmount);
        userTotalTokenBalance[_tokenGet][msg.sender] -= _feeAmount;
        userTotalTokenBalance[_tokenGet][feeAccount] += _feeAmount;

        isOrderFilled[_id] = true;
        emit OrderFilled(_id, _user, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function fillOrder(uint256 _id) public {
        Order storage order = orders[_id];

        require(_id > 0 && _id <= orderCount, "Exchange: Order Does Not Exist");
        require(!isOrderCancelled[_id], "Exchange: Order Has Been Cancelled");
        require(!isOrderFilled[_id], "Exchange: Order Has Been Filled");
        require(totalBalanceOf(order.tokenGet, msg.sender) - activeBalanceOf(order.tokenGet, msg.sender) >= order.amountGet, "Exchange: Insufficient Funds on Exchange");

        _swapAndPayFee(order.id, order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive);
    }
}
