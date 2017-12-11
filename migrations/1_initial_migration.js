var Migrations = artifacts.require("./Migrations.sol");
var TeamWallet = artifacts.require("./TeamWallet.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(TeamWallet, 'Cool Team', {value: 100});
};
