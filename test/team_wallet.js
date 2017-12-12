const TeamWallet = artifacts.require('TeamWallet.sol');

contract('TeamWallet', (accounts) => {
  let teamWallet;

  const TEAM_WALLET_OWNER = accounts[0];
  const ACC_1 = accounts[1];
  const ACC_2 = accounts[2];

  const TEAM_WALLET_INITIAL_DEPOSIT = web3.toWei(1, 'ether');
  const TEAM_WALLET_INITIAL_NAME = 'Cool Team';
   
  before('setup', async() => {
    let inst = await TeamWallet.deployed();
    teamWallet = inst;
  });

  afterEach('reset', async() => {
    let inst = await TeamWallet.new(TEAM_WALLET_INITIAL_NAME, {value: web3.toWei(1, 'ether')});
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

  describe('add player wallet', () => {
    const player1Name = 'Player_1';

    it('return address on adding', async() => {      
      let addr = await teamWallet.addPlayerWallet.call(player1Name, ACC_1);
      assert.isTrue(addr.length > 10, 'wrong address');
    });

    it('LogPlayerWalletAdded called', async() => {
      let tx = await teamWallet.addPlayerWallet(player1Name, ACC_1);
      let logs = tx.logs;
      assert.equal(logs.length, 1, 'should be one event');
      assert.equal(logs[0].event, 'LogPlayerWalletAdded', 'shold be LogPlayerWalletAdded event');
      assert.include(web3.toAscii(logs[0].args.name), player1Name, 'wrong player wallet name'); //  not sure if it is correct check
      assert.isTrue(logs[0].args.walletAddress > 10, 'wrong address');
    });
  });

});