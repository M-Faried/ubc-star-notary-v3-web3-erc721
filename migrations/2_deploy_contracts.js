const StarNotary = artifacts.require("StarNotary");

module.exports = function (deployer) {
  deployer.deploy(StarNotary, "StarNotaryERC721", "STR");
};
