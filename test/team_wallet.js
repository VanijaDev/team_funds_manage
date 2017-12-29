const TeamWallet = artifacts.require('TeamWallet.sol');
const PlayerWallet = artifacts.require('PlayerWallet.sol');
const Asserts = require('./helpers/asserts.js');

contract('TeamWallet', (accounts) => {
  let asserts = Asserts(assert);

  let teamWallet;

  const TEAM_WALLET_OWNER = accounts[0];
  const ACC_1 = accounts[1];
  const ACC_2 = accounts[2];

  const TEAM_WALLET_INITIAL_DEPOSIT = web3.toWei(1, 'finney');
  const TEAM_WALLET_INITIAL_NAME = 'Cool Team';
     
  const player1_Name = 'Player_1';
  const player1_Owner = ACC_1;
  const player2_Owner = ACC_2;
   
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

  describe('add & remove player wallet', async() => {
    it('add player wallet', async() => {  
      
      //  return address
      let addr = await teamWallet.addPlayerWallet.call(player1_Name, player1_Owner);
      assert.isTrue(addr.length > 10, 'wrong address');

      //  only owner can create new team wallet
      asserts.throws(teamWallet.addPlayerWallet(player1_Name, player1_Owner, {from: ACC_2}), 'should throw, because not owner');
  
      //  LogPlayerWalletAdded
      let tx = await teamWallet.addPlayerWallet(player1_Name, player1_Owner);
      let logs = tx.logs;
      assert.equal(logs.length, 1, 'should be one event');
      assert.equal(logs[0].event, 'LogPlayerWalletAdded', 'shold be LogPlayerWalletAdded event');
      assert.include(web3.toAscii(logs[0].args.name), player1_Name, 'wrong player wallet name'); //  not sure if it is correct check
      assert.isTrue(logs[0].args.walletAddress > 10, 'wrong address');
  
      //  added to playerWallets
      let addedWallet = await teamWallet.playerWallets.call(addr);
      assert.isDefined(player1_Owner, 'wallet must be added');

      let player = await PlayerWallet.at(addr);
  
      //  playerName
      assert.equal(await player.playerName.call(), logs[0].args.name, 'player with wrong name was created');
      
      //  team
      assert.equal(await player.team.call(), teamWallet.address, 'wrong team address');
  
      //  owner
      assert.equal(await player.owner.call(), player1_Owner, 'wrong owner')
  
      //  walletManager
      assert.equal(await teamWallet.owner.call(), await player.walletManager.call(), 'wrong walletManager')

      //  another wallet for the same owner can not be added
      asserts.throws(teamWallet.addPlayerWallet(player1_Name, player1_Owner), 'should throw, because owner already has wallet');
    });
  
    it('remove player wallet', async() => {
      let tx = await teamWallet.addPlayerWallet(player1_Name, player1_Owner);
      let playerWalletAddress = tx.logs[0].args.walletAddress
      
      tx = await teamWallet.removePlayerWallet(player1_Owner);
      logs = tx.logs;
      assert.equal(logs.length, 1, 'should be one event');
      assert.equal(logs[0].event, 'LogPlayerWalletRemoved', 'shold be LogPlayerWalletRemoved event');
      assert.include(web3.toAscii(logs[0].args.name), player1_Name, 'wrong player wallet name'); //  not sure if it is correct check
      assert.equal(logs[0].args.walletAddress, playerWalletAddress, 'wrong address');
  
      //  check playerWallets
      let playerWallet = await teamWallet.playerWallets.call(player1_Owner);
      assert.isUndefined(playerWallet.address, 'should be no wallet');
      
    });
  });

  it('player wallet name', async() => {
    let tx = await teamWallet.addPlayerWallet(player1_Name, player1_Owner);
    let addr = tx.logs[0].args.walletAddress;

    let name = await teamWallet.playerWalletName.call(player1_Owner);
    assert.equal(name, player1_Name, 'name must be equal');
  });

  it('transfer to player wallet', async() => {
    const transferAmount = TEAM_WALLET_INITIAL_DEPOSIT / 100;

    //  create new player wallet
    let tx = await teamWallet.addPlayerWallet(player1_Name, player1_Owner);
    let addr = tx.logs[0].args.walletAddress;

    //  check call() result
    let result = await teamWallet.transferToPlayerWallet.call(player1_Owner, transferAmount);
    assert.isTrue(result, 'transfer should be successfull');

    // fail if not owner
    asserts.throws(teamWallet.transferToPlayerWallet(player1_Owner, transferAmount, {from: ACC_2}, 'should fail, because not owner sent'));

    //  send and check player wallet balance
    await teamWallet.transferToPlayerWallet(player1_Owner, transferAmount);
    let bal = await web3.eth.getBalance(addr);
    assert.equal(bal, transferAmount, 'wrong balance amount');
  });

});