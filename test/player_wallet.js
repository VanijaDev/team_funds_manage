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
      
  const player1Name = 'Player_1';
  const player1Owner = ACC_1;
    
  before('setup', async() => {
    teamWallet = await TeamWallet.deployed();
    
    //  create new player wallet
    let tx = await teamWallet.addPlayerWallet(player1Name, player1Owner);
    let addr = tx.logs[0].args.walletAddress;
    playerWallet = PlayerWallet.at(addr);
  });

  afterEach('reset', async() => {
    teamWallet = await TeamWallet.new(TEAM_WALLET_INITIAL_NAME, {value: TEAM_WALLET_INITIAL_DEPOSIT});
    
    //  create new player wallet
    let tx = await teamWallet.addPlayerWallet(player1Name, player1Owner);
    let addr = tx.logs[0].args.walletAddress;
    playerWallet = PlayerWallet.at(addr);
  });

  it('initial values', async() => {
     // owner
     assert.equal(await playerWallet.owner.call(), player1Owner, 'wrong player owner');

     // team
    assert.equal(await playerWallet.team.call(), teamWallet.address, 'team should be teamWallet address');
    assert.equal(await playerWallet.getTeam.call(), teamWallet.address, 'getTeam should be teamWallet address');

    //  wallet manager
    assert.equal(await playerWallet.walletManager.call(), await teamWallet.owner.call(), 'walletManager should be the same');

    //  name
    assert.include(await playerWallet.getPlayerName.call(), web3.fromAscii(player1Name), 'wrong player name');
  });

  describe('show balance', () => {
    const transferAmount = TEAM_WALLET_INITIAL_DEPOSIT / 5;

    it('show balance should succeed', async () => {
      await teamWallet.transferToPlayerWallet(playerWallet.address, transferAmount);
  
      let bal = await playerWallet.showBalance.call();
      assert.equal(bal.toNumber(), transferAmount, 'wrong balance');
    });
  
    it('show balance should show only to player wallet owner or manager', async () => {
      await teamWallet.transferToPlayerWallet(playerWallet.address, transferAmount);
  
      asserts.throws(playerWallet.showBalance({from: ACC_2}));
    });
  });
  
  describe('transfer method', () => {
    
  });

});