pragma solidity ^0.4.17;

import "./PlayerWallet.sol";

contract TeamWallet is BasicWallet {
    string public teamName;
    
    mapping (address => PlayerWallet) public playerWallets;
    
    //  MODIFIERS
    modifier ourTeamPlayersWalletOnly(address playerWallet) {
      require(playerWallets[playerWallet].getTeam() == address(this));
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
      PlayerWallet playerWallet = new PlayerWallet(playerName, ownerAddress, this, owner);
      playerWallets[address(playerWallet)] = playerWallet;
      
      LogPlayerWalletAdded(playerName, playerWallet);
      return playerWallet;
    }
    
    function removePlayerWallet(address walletAddress) public onlyOwner returns (bool) {
      PlayerWallet player = playerWallets[address(walletAddress)];
      bytes32 playerName = player.getPlayerName();
      require(playerName.length > 0);

      delete playerWallets[address(walletAddress)];
      
      LogPlayerWalletRemoved(playerName, walletAddress);
      return true;
    }
    
    function playerWalletName(address addr) public constant returns(string) {
      PlayerWallet wallet = playerWallets[addr];
      bytes32 name = wallet.getPlayerName();
      
      return bytes32ToString(name);
    }
    
    function transferToPlayerWallet(address playerWallet, uint amount) public 
      onlyOwner 
      ourTeamPlayersWalletOnly(playerWallet) returns(bool) 
      {
        require(amount > 0);
        require(amount <= this.balance);
        
        playerWallet.transfer(amount);
        
        LogTransfer(playerWallet, amount);
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