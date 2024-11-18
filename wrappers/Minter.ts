import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell } from "@ton/core";
import { encodeOffChainContent } from "../libs/cells";

export default class Minter implements Contract {

  static initData(
    adminAddress: Address,
    content: string,
    jettonWalletCode: Cell
  ): Cell {
    return beginCell()
      .storeCoins(0)
      .storeAddress(adminAddress)
      .storeRef(encodeOffChainContent(content))
      .storeRef(jettonWalletCode)
      .endCell();
  }

  static createForDeploy(code: Cell, data: Cell): Minter {
    const workchain = 0; // deploy to workchain 0
    const address = contractAddress(workchain, { code, data });
    return new Minter(address, { code, data });
  }

  constructor(readonly address: Address, readonly init?: { code: Cell, data: Cell }) {}

  async sendDeploy(provider: ContractProvider, via: Sender) {
    await provider.internal(via, {
      value: "0.2", // send TON to contract for rent
      bounce: false
    });
  }
}