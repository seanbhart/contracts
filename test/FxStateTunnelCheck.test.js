const Contract = require("@ethersproject/contracts").Contract;
const expect = require("chai").expect;
const providers = require("ethers").providers;
const ethers = require("hardhat").ethers;
const FxStateRootTunnel = require("../artifacts/contracts/examples/state-transfer/FxStateRootTunnel.sol/FxStateRootTunnel.json");
const FxStateChildTunnel = require("../artifacts/contracts/examples/state-transfer/FxStateChildTunnel.sol/FxStateChildTunnel.json");

describe("FxState Tunnel Checks", function () {
  const GOERLI_CHECKPOINT_MANAGER = `0x2890bA17EfE978480615e330ecB65333b880928e`;
  const GOERLI_FX_ROOT = `0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA`;
  const MUMBAI_FX_CHILD = `0xCf73231F28B7331BBe3124B907840A94851f9f11`;

  // IMPORTANT: UPDATE THESE ADDRESSES BEFORE TESTING
  const rootTunnelAddress = `0x4dd55B02005e4bc83b68CC33ae9325EacE6AB75f`;
  const childTunnelAddress = `0xB4914bb58953380b54B7b041129ea2c5b3E0714B`;

  const JSON_RPC_GOERLI = `${process.env.NETWORK_GOERLI}`;
  const JSON_RPC_POLYGON_MUMBAI = `${process.env.NETWORK_POLYGON_MUMBAI}`;
  let providerGoerli;
  let providerMumbai;

  let owner;
  let addr1;
  let addr2;
  let addrs;

  let rootTunnel;
  let childTunnel;

  let latestBlockNumber;

  before(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    console.log("Created signers. Owner:", owner.address);

    providerGoerli = new providers.JsonRpcProvider(JSON_RPC_GOERLI);
    providerMumbai = new providers.JsonRpcProvider(JSON_RPC_POLYGON_MUMBAI);
  });

  describe("Chain Checks", function () {
    it("Should have gotten the latest block number.", async function () {
      latestBlockNumber = await providerGoerli.getBlockNumber();
      console.log("Latest block number (Goerli): ", latestBlockNumber);
      expect(latestBlockNumber).not.to.be.null;
    });
  });

  describe("Tunnel Checks", function () {
    it("Child Tunnel address on Root Tunnel contract should have been updated from burn address", async function () {
      rootTunnel = new Contract(
        rootTunnelAddress,
        FxStateRootTunnel.abi,
        providerGoerli
      );
      const childTunnelCheck = await rootTunnel.fxChildTunnel();
      console.log(
        "Root Tunnel Set Child Tunnel address check: ",
        childTunnelCheck
      );

      const rootTunnelData = await rootTunnel.latestData();
      if (rootTunnelData !== "0x") {
        console.log(
          "Root Tunnel Data: ",
          ethers.utils.parseBytes32String(rootTunnelData)
        );
      }

      expect(childTunnelCheck).equals(childTunnelAddress);
    });

    it("Check Child Tunnel variables", async function () {
      childTunnel = new Contract(
        childTunnelAddress,
        FxStateChildTunnel.abi,
        providerMumbai
      );
      const rootTunnelCheck = await childTunnel.fxRootTunnel();
      console.log(
        "Child Tunnel Set Root Tunnel address check: ",
        rootTunnelCheck
      );

      const childTunnelStateId = await childTunnel.latestStateId();
      const childTunnelMsgSender = await childTunnel.latestRootMessageSender();
      const childTunnelData = await childTunnel.latestData();
      console.log("Child Tunnel State ID: ", childTunnelStateId);
      console.log("Child Tunnel Message Sender: ", childTunnelMsgSender);
      if (childTunnelData !== "0x") {
        console.log(
          "Child Tunnel Data: ",
          ethers.utils.parseBytes32String(childTunnelData)
        );
      }

      expect(rootTunnelCheck).equals(rootTunnelAddress);
    });
  });
});
