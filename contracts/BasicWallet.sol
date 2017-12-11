pragma solidity ^0.4.17;

contract BasicWallet {
    address public owner;
    
    //  MODIFIERS
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    //  EVENTS
    event LogTransfer(address to, uint amount);
    
    function BasicWallet() public {
        owner = msg.sender;
    }
    
    function moveOwnership(address newOwner) public onlyOwner returns(bool) {
        owner = newOwner;
    }
}