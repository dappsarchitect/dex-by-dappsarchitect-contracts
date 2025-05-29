// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * (10 ** decimals);

        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Token: Insufficient Funds");
        require(_to != address(0), "Token: Recipient Is Address 0");

        balanceOf[msg.sender] -= _value; // Deduct tokens from sender
        balanceOf[_to] += _value; // Credit tokens to recipient
            
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
