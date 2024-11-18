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

  async sendUpdateContent(provider: ContractProvider, via: Sender, queryId: number, content: string, value: string) {
    const messageBody = beginCell()
      .storeUint(4, 32) // op 
      .storeUint(queryId, 64) // query id
      .storeRef(encodeOffChainContent(content))
      .endCell();
    
    await provider.internal(via, {
      value,
      body: messageBody
    });
  }

  async sendMint(provider: ContractProvider, via: Sender, queryId: number, fwdValue: bigint, jettonAmount: bigint, to: Address, value: string) {
    const messageBody = beginCell()
      .storeUint(21, 32) // op 
      .storeUint(queryId, 64) // query id
      .storeAddress(to)
      .storeCoins(fwdValue)
      .storeRef(
        beginCell()
            .storeUint(0x178d4519, 32)
            .storeUint(queryId, 64)
            .storeCoins(jettonAmount)
        .endCell()
      )
      .endCell();
    
    await provider.internal(via, {
      value,
      body: messageBody
    });
  }
}