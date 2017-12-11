const TeamWallet = artifacts.require('TeamWallet.sol');

contract('TeamWallet', (accounts) => {
  let teamWallet;

  const TEAM_WALLET_OWNER = accounts[0];
  const ACC_1 = accounts[1];
  const ACC_2 = accounts[2];

  const TEAM_WALLET_INITIAL_DEPOSIT = 50000000000000000000; // 50 ether

  before('setup', async() => {
    teamWallet = await TeamWallet.deployed();
  });

  afterEach('reset', async() => {
    teamWallet = TeamWallet.new('Cool Team', {value: TEAM_WALLET_INITIAL_DEPOSIT})
  });

  describe('initial values', async() => {
    
  });

});