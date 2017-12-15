module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 2900000
      // from: "0xda9b1a939350dc7198165ff84c43ce77a723ef73"
    }
  }
};