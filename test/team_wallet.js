const TeamWallet = artifacts.require('TeamWallet.sol');
const PlayerWallet = artifacts.require('PlayerWallet.sol');

contract('TeamWallet', (accounts) => {
  let teamWallet;

  const TEAM_WALLET_OWNER = accounts[0];
  const ACC_1 = accounts[1];
  const ACC_2 = accounts[2];

  const TEAM_WALLET_INITIAL_DEPOSIT = web3.toWei(1, 'finney');
  const TEAM_WALLET_INITIAL_NAME = 'Cool Team';
   
  before('setup', async() => {
    let inst = await TeamWallet.deployed();
    teamWallet = inst;
  });

  afterEach('reset', async() => {
    let inst = await TeamWallet.new(TEAM_WALLET_INITIAL_NAME, {value: TEAM_WALLET_INITIAL_DEPOSIT});
    teamWallet = inst;
  });

  describe('test initial', () => {
    it('balance', () => {
      let bal = web3.eth.getBalance(teamWallet.address);
      assert.equal(bal.toNumber(), TEAM_WALLET_INITIAL_DEPOSIT, 'wrong initial balance');
    });

    it('name', async() => {
      let name = await teamWallet.teamName.call();
      assert.equal(name, TEAM_WALLET_INITIAL_NAME, 'wrong initial name');
    });
  });

  it('update name', async () => {
    const newName = 'Cooler name';

    let name = await teamWallet.teamName.call();
    assert.isTrue(await teamWallet.updateName.call(newName), 'name not updated');
    await teamWallet.updateName(newName);
    let updatedName = await teamWallet.teamName.call();

    assert.equal(newName, updatedName, 'name was not updated');
  });

  describe('add & remove player wallet', () => {   
    const player1Name = 'Player_1';
    const playerOwner = ACC_1;

    it('add player wallet', async() => {  
      //  return address
      let addr = await teamWallet.addPlayerWallet.call(player1Name, playerOwner);
      assert.isTrue(addr.length > 10, 'wrong address');
  
      //  LogPlayerWalletAdded
      let tx = await teamWallet.addPlayerWallet(player1Name, playerOwner);
      let logs = tx.logs;
      assert.equal(logs.length, 1, 'should be one event');
      assert.equal(logs[0].event, 'LogPlayerWalletAdded', 'shold be LogPlayerWalletAdded event');
      assert.include(web3.toAscii(logs[0].args.name), player1Name, 'wrong player wallet name'); //  not sure if it is correct check
      assert.isTrue(logs[0].args.walletAddress > 10, 'wrong address');
  
      //  added to playerWallets
      let addedWallet = await teamWallet.playerWallets.call(addr);
      assert.isDefined(addedWallet, 'wallet must be added');

      let player = await PlayerWallet.at(addr);
  
      //  playerName
      assert.equal(await player.playerName.call(), logs[0].args.name, 'player with wrong name was created');
      
      //  team
      assert.equal(await player.team.call(), teamWallet.address, 'wrong team address');
  
      //  owner
      assert.equal(await player.owner.call(), playerOwner, 'wrong owner')
  
      //  walletManager
      assert.equal(await teamWallet.owner.call(), await player.walletManager.call(), 'wrong walletManager')
    });
  
    it('remove player wallet', async() => {  
      //  check result using call()
      let addr = await teamWallet.addPlayerWallet.call(player1Name, playerOwner);
      let result = await teamWallet.removePlayerWallet.call(addr);
      assert.isTrue(result, 'should be removed');
  
      //  check log
      let tx = await teamWallet.addPlayerWallet(player1Name, playerOwner);
      let playerWalletAddress = tx.logs[0].args.walletAddress
      
      tx = await teamWallet.removePlayerWallet(playerWalletAddress);
      logs = tx.logs;
      assert.equal(logs.length, 1, 'should be one event');
      assert.equal(logs[0].event, 'LogPlayerWalletRemoved', 'shold be LogPlayerWalletRemoved event');
      assert.include(web3.toAscii(logs[0].args.name), player1Name, 'wrong player wallet name'); //  not sure if it is correct check
      assert.equal(logs[0].args.walletAddress, playerWalletAddress, 'wrong address');
  
      //  check playerWallets
      let playerWallet = await teamWallet.playerWallets.call(logs[0].args.walletAddress);
      assert.isUndefined(playerWallet.address, 'wallet must be added');
      
    });
  });

  it('player wallet name', async() =>{   
    const player1Name = 'Player_1';
    const playerOwner = ACC_1;

    let tx = await teamWallet.addPlayerWallet(player1Name, playerOwner);
    let addr = tx.logs[0].args.walletAddress;

    let name = await teamWallet.playerWalletName.call(addr);
    assert.equal(name, player1Name, 'name must be equal');
  });

});