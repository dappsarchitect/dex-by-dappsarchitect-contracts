// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

// This contract is not to be deployed; it is only meant
// to be inherited by the Exchange contract. Hence abstract.

abstract contract FlashLoanProvider {
    event FlashLoan(address token, uint256 amount, uint256 timestamp);

    function flashLoan(address _token, uint256 _amount, bytes memory _data) public {
        Token(_token).transfer(msg.sender, _amount);
    
        emit FlashLoan(_token, _amount, block.timestamp);
    }
}
