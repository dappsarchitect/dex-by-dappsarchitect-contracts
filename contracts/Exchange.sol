// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address => uint256)) private userTotalTokenBalance;

    event TokensDeposited(address indexed token, address indexed user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositTokens(address _token, uint256 _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount), "Exchange: Token Transfer Failed");
        userTotalTokenBalance[_token][msg.sender] += _amount;
        emit TokensDeposited(_token, msg.sender, _amount, userTotalTokenBalance[_token][msg.sender]);
    }

    function totalBalanceOf(address _token, address _user) public view returns (uint256){
        return userTotalTokenBalance[_token][_user];
    }
}
