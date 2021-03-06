const TeamWallet = artifacts.require('TeamWallet.sol');
const PlayerWallet = artifacts.require('PlayerWallet.sol');
const Asserts = require('./helpers/asserts.js');

contract('PlayerWallet', (accounts) => {
  let asserts = Asserts(assert);
  
  let teamWallet;
  let playerWallet;

  const TEAM_WALLET_OWNER = accounts[0];
  const ACC_1 = accounts[1];
  const ACC_2 = accounts[2];

  const TEAM_WALLET_INITIAL_DEPOSIT = web3.toWei(1, 'finney');
  const TEAM_WALLET_INITIAL_NAME = 'Cool Team';
      
  const player1_Name = 'Player_1';
  const player1_Owner = ACC_1;
    
  before('setup', async() => {
    teamWallet = await TeamWallet.deployed();
    
    //  create new player wallet
    let tx = await teamWallet.addNewPlayerWallet(player1_Name, player1_Owner);
    let addr = tx.logs[0].args.walletAddress;
    playerWallet = PlayerWallet.at(addr);
  });

  afterEach('reset', async() => {
    teamWallet = await TeamWallet.new(TEAM_WALLET_INITIAL_NAME, {value: TEAM_WALLET_INITIAL_DEPOSIT});
    
    //  create new player wallet
    let tx = await teamWallet.addNewPlayerWallet(player1_Name, player1_Owner);
    let addr = tx.logs[0].args.walletAddress;
    playerWallet = PlayerWallet.at(addr);
  });

  it('initial values', async() => {
     // owner
     assert.equal(await playerWallet.owner.call(), player1_Owner, 'wrong player owner');

     // team
    assert.equal(await playerWallet.team.call(), teamWallet.address, 'team should be teamWallet address');

    //  wallet manager
    assert.equal(await playerWallet.walletManager.call(), await teamWallet.owner.call(), 'walletManager should be the same');

    //  name
    assert.include(await playerWallet.playerName.call(), web3.fromAscii(player1_Name), 'wrong player name');
  });

  describe('show balance', () => {
    const transferAmount = TEAM_WALLET_INITIAL_DEPOSIT / 100;

    it('show balance should succeed', async () => {
      await teamWallet.transferToPlayerWallet(player1_Owner, transferAmount);
  
      let bal = await playerWallet.showBalance.call();
      assert.equal(bal.toNumber(), transferAmount, 'wrong balance');
    });
  
    it('show balance should show only to player wallet owner or manager', async () => {
      await teamWallet.transferToPlayerWallet(player1_Owner, transferAmount);
  
      asserts.throws(playerWallet.showBalance({from: ACC_2}));
    });
  });
  
  describe('transfer method', () => {
    const transferAmount = TEAM_WALLET_INITIAL_DEPOSIT / 100;

    beforeEach('create and deposit new Player wallet', async () => {
      await teamWallet.transferToPlayerWallet(player1_Owner, transferAmount);
    });

    it('transfer result', async () => {
      let result = await playerWallet.transfer.call(TEAM_WALLET_OWNER, (transferAmount / 2), {from: player1_Owner});
      assert.isTrue(result, 'transfer should success');

      asserts.throws(playerWallet.transfer(TEAM_WALLET_OWNER, (transferAmount / 2), 'transfer should fail - not playerWallet owner sent'));
      asserts.throws(playerWallet.transfer(TEAM_WALLET_OWNER, (transferAmount * 2), {from: player1_Owner}), 'transfer should fail - sends too much');
      asserts.throws(playerWallet.transfer(0x0, (transferAmount / 2), {from: ACC_2}), 'transfer should fail - bad address');

    });

    it('check balances after transfer', async () => {
      let playerWalletBalanceBefore = await web3.eth.getBalance(playerWallet.address).toNumber();
      let acc2BalanceBefore = await web3.eth.getBalance(ACC_2).toNumber();
      let amountToTransfer = transferAmount / 2;

      await playerWallet.transfer(ACC_2, amountToTransfer, {from: player1_Owner});
      
      let playerWalletBalanceAfter = await web3.eth.getBalance(playerWallet.address).toNumber();
      let acc2BalanceAfter = await web3.eth.getBalance(ACC_2).toNumber();

      assert.equal(playerWalletBalanceAfter, (playerWalletBalanceBefore - amountToTransfer), 'wrong player wallet balance after tx');
      assert.equal(acc2BalanceAfter, (acc2BalanceBefore + amountToTransfer), 'wrong acc2 balance after tx');
    });
  });

});