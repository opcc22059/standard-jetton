import { Contract, ContractProvider, Sender, Address, Cell, contractAddress, beginCell, Slice, TupleItemSlice, TupleItemInt, Dictionary } from "@ton/core";
import { MINTER_OP_UPDATE_CODE_AND_DATA, MINTER_OP_UPDATE_CONTENT, MINTER_OP_UPDATE_PRICE, MINTER_OP_UPDATE_PRICE_INC, MINTER_OP_UPDATE_PROXY_WHITELIST } from "./minter/opcodes";
import { encodeOffChainContent } from "../libs/cells";
import { COMMON_OP_STAKE, COMMON_OP_UPDATE_ADMIN } from "./common/opcodes";

export default class Minter implements Contract {

  static initData(
    adminAddress: Address,
    content: string,
    jettonWalletCode: Cell
  ): Cell {
    return beginCell()
      .storeCoins(0)
      .storeAddress(adminAddress)
      .storeCell(encodeOffChainContent(content))
      .storeCell(jettonWalletCode)
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