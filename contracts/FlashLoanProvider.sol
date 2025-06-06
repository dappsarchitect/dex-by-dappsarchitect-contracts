// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

interface IFlashLoanReceiver {
    function receiveFlashLoan(address token, uint256 amount, bytes memory data) external;
}

// This contract is not to be deployed; it is only meant
// to be inherited by the Exchange contract. Hence abstract.
abstract contract FlashLoanProvider {
    event FlashLoan(address token, uint256 amount, uint256 timestamp);

    function flashLoan(address _token, uint256 _amount, bytes memory _data) public {
        // gets current token balance
        uint256 tokenBalanceBefore = Token(_token).balanceOf(address(this));

        // requires this contract to have sufficient funds to lend
        require(tokenBalanceBefore >= _amount, "FlashLoanProvider: Insufficient Funds for Loan");
        //require(tokenBalanceBefore > 0, "FlashLoanProvider: Insufficient Funds for Loan");

        // lends the money to msg.sender and stops the function if the transfer fails
        require(Token(_token).transfer(msg.sender, _amount), "FlashLoanProvider: Transfer Failed");
    
        // asks for the money back; talks to the FlashLoanUser, and calls a function 
        // that pays the money back, i.e. calls receiveFlashLoan() on msg.sender
        IFlashLoanReceiver(msg.sender).receiveFlashLoan(_token, _amount, _data);

        // gets token balance after
        uint256 tokenBalanceAfter = Token(_token).balanceOf(address(this));

        // requires this contract to have received back the money
        require(tokenBalanceAfter >= tokenBalanceBefore, "FlashLoanProvider: No Funds Received");

        // emits an event
        emit FlashLoan(_token, _amount, block.timestamp);
    }
}
