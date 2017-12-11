pragma solidity ^0.4.17;

import "./BasicWallet.sol";

/**
* owner - is TeamWallet, because it creates PlayerWallet
**/

contract PlayerWallet is BasicWallet {
    bytes32 public playerName;
    
    address public walletManager;
    address public team;
    
    function PlayerWallet(bytes32 _playerName, address _owner, address _team, address _walletManager) public payable {
        playerName = _playerName;
        owner = _owner;
        team = _team;
        walletManager = _walletManager;
    }
    
    function() public payable {}
    
    function showBalance() public view returns(uint amount) {
        if (owner == msg.sender || walletManager == msg.sender) {
            return this.balance;   
        }
        
        revert();
    }
    
    function transfer(address to, uint amount) public onlyOwner returns (bool) {
        require(to != address(0));
        require(amount <= this.balance);
        
        to.transfer(amount);
        
        LogTransfer(to, amount);
        return true;
    }
    
    //  external
    function getPlayerName() external view returns(bytes32) {
        return playerName;
    }
    
    function getTeam() external view returns(address) {
        return team;
    }
}