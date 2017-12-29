pragma solidity ^0.4.17;

import "./PlayerWallet.sol";

contract TeamWallet is BasicWallet {
    string public teamName;
    
    //  ownerAddress => PlayerWallet
    mapping (address => PlayerWallet) public playerWallets;
    
    //  MODIFIERS
    modifier ourTeamPlayersWalletOnly(address ownerAddress) {
      address teamAddr = playerWallets[ownerAddress].team();
      require(teamAddr == address(this));
      _;
    }
    
    //  EVENTS
    event LogPlayerWalletAdded(bytes32 name, address walletAddress);
    event LogPlayerWalletRemoved(bytes32 name, address walletAddress);
    
    function TeamWallet(string _teamName) public payable {
      teamName = _teamName;
    }
    
    function () public payable {}
    
    function updateName(string newName) public onlyOwner returns (bool) {
      teamName = newName;
      
      return true;
    }
    
    function addPlayerWallet(bytes32 playerName, address ownerAddress) public onlyOwner returns (address) {
      require(address(playerWallets[ownerAddress].team) == address(0));

      PlayerWallet playerWallet = new PlayerWallet(playerName, ownerAddress, address(this), owner);
      playerWallets[ownerAddress] = playerWallet;
      
      LogPlayerWalletAdded(playerName, playerWallet);
      return playerWallet;
    }
    
    function removePlayerWallet(address ownerAddress) public onlyOwner returns (bool) {
      require(address(playerWallets[ownerAddress].team) != address(0));

      PlayerWallet playerWallet = playerWallets[address(ownerAddress)];
      bytes32 playerName = playerWallet.playerName();

      delete playerWallets[address(ownerAddress)];
      
      LogPlayerWalletRemoved(playerName, address(playerWallet));
      return true;
    }
    
    function playerWalletName(address ownerAddress) public constant returns(string) {
      PlayerWallet wallet = playerWallets[ownerAddress];
      bytes32 name = wallet.playerName();
      
      return bytes32ToString(name);
    }
    
    function transferToPlayerWallet(address ownerAddress, uint amount) public 
      onlyOwner 
      ourTeamPlayersWalletOnly(ownerAddress)
      returns(bool) 
      {
        require(amount > 0 && amount <= this.balance);
        
        playerWallets[ownerAddress].transfer(amount);
        
        LogTransfer(address(playerWallets[ownerAddress]), amount);
        return true;
    } 
    
    //  private
    function bytes32ToString(bytes32 x) private pure returns (string) {
      bytes memory bytesString = new bytes(32);
      uint charCount = 0;
      for (uint j = 0; j < 32; j++) {
          byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
          if (char != 0) {
              bytesString[charCount] = char;
              charCount++;
          }
      }
      bytes memory bytesStringTrimmed = new bytes(charCount);
      for (j = 0; j < charCount; j++) {
          bytesStringTrimmed[j] = bytesString[j];
      }
      return string(bytesStringTrimmed);
    }
}