import {BlockchainAddress} from "@partisiablockchain/abi-client";
import {getRequest} from "./BaseClient";
import {Buffer} from "buffer";

export class AvlClient {
  readonly host: string;

  constructor(host: string) {
    this.host = host;
  }

  public getContractState(address: BlockchainAddress): Promise<Buffer | undefined> {
    return getRequest<Buffer>(this.contractStateQueryUrl(address) + "?stateOutput=binary");
  }

  public getContractStateAvlValue(address: BlockchainAddress, treeId: number, key: Buffer): Promise<Buffer | undefined> {
    return getRequest<Buffer>(`${this.contractStateQueryUrl(address)}/avl/${treeId}/${key.toString("hex")}`);
  }

  public getContractStateAvlNextN(address: BlockchainAddress, treeId: number, key: Buffer | undefined, n: number): Promise<Array<Record<string, string>> | undefined> {
    if (key === undefined) {
      return getRequest<Array<Record<string, string>>>(`${this.contractStateQueryUrl(address)}/avl/${treeId}/next?n=${n}`);
    } else {
      return getRequest<Array<Record<string, string>>>(`${this.contractStateQueryUrl(address)}/avl/${treeId}/next/${key.toString("hex")}?n=${n}`);
    }
  }

  private contractStateQueryUrl(address: BlockchainAddress): string {
    return `${this.host}/shards/${this.shardForAddress(
        address
    )}/blockchain/contracts/${address.asString()}`;
  }

  private shardForAddress(address: BlockchainAddress): string {
    const numOfShards = 3;
    const buffer = address.asBuffer();
    const shardIndex = Math.abs(buffer.readInt32BE(17)) % numOfShards;
    return "Shard" + shardIndex;
  }
}