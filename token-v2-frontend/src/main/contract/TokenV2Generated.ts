/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import BN from "bn.js";
import {
  AbiParser,
  AbstractBuilder, BigEndianReader,
  FileAbi, FnKinds, FnRpcBuilder, RpcReader,
  ScValue,
  ScValueEnum, ScValueOption,
  ScValueStruct,
  StateReader, TypeIndex,
  StateBytes,
  BlockchainAddress
} from "@partisiablockchain/abi-client";
import {BigEndianByteOutput} from "@secata-public/bitmanipulation-ts";

const fileAbi: FileAbi = new AbiParser(Buffer.from(
  "5042434142490a020005040000000006010000000e416c6c6f7765644164647265737300000002000000056f776e65720d000000077370656e6465720d01000000085472616e736665720000000200000002746f0d00000006616d6f756e7405010000000a546f6b656e537461746500000007000000046e616d650b00000008646563696d616c73010000000673796d626f6c0b000000056f776e65720d0000000c746f74616c5f737570706c79050000000862616c616e636573190d0500000007616c6c6f7765641900000501000000134576656e74537562736372697074696f6e496400000001000000067261775f696408010000000f45787465726e616c4576656e74496400000001000000067261775f696408010000000b536563726574566172496400000001000000067261775f69640300000007010000000a696e697469616c697a65ffffffff0f00000004000000046e616d650b0000000673796d626f6c0b00000008646563696d616c73010000000c746f74616c5f737570706c790502000000087472616e73666572010000000200000002746f0d00000006616d6f756e7405020000000d62756c6b5f7472616e736665720200000001000000097472616e73666572730e0001020000000d7472616e736665725f66726f6d03000000030000000466726f6d0d00000002746f0d00000006616d6f756e7405020000001262756c6b5f7472616e736665725f66726f6d04000000020000000466726f6d0d000000097472616e73666572730e00010200000007617070726f76650500000002000000077370656e6465720d00000006616d6f756e74050200000010617070726f76655f72656c61746976650700000002000000077370656e6465720d0000000564656c74610a0002",
  "hex"
)).parseAbi();

type Option<K> = K | undefined;

export interface AllowedAddress {
  owner: BlockchainAddress;
  spender: BlockchainAddress;
}

export function newAllowedAddress(owner: BlockchainAddress, spender: BlockchainAddress): AllowedAddress {
  return {owner, spender};
}

function fromScValueAllowedAddress(structValue: ScValueStruct): AllowedAddress {
  return {
    owner: BlockchainAddress.fromBuffer(structValue.getFieldValue("owner")!.addressValue().value),
    spender: BlockchainAddress.fromBuffer(structValue.getFieldValue("spender")!.addressValue().value),
  };
}

export interface Transfer {
  to: BlockchainAddress;
  amount: BN;
}

export function newTransfer(to: BlockchainAddress, amount: BN): Transfer {
  return {to, amount};
}

function fromScValueTransfer(structValue: ScValueStruct): Transfer {
  return {
    to: BlockchainAddress.fromBuffer(structValue.getFieldValue("to")!.addressValue().value),
    amount: structValue.getFieldValue("amount")!.asBN(),
  };
}

function buildRpcTransfer(value: Transfer, builder: AbstractBuilder) {
  const structBuilder = builder.addStruct();
  structBuilder.addAddress(value.to.asBuffer());
  structBuilder.addU128(value.amount);
}

export interface TokenState {
  name: string;
  decimals: number;
  symbol: string;
  owner: BlockchainAddress;
  totalSupply: BN;
  balances: Option<Map<BlockchainAddress, BN>>;
  allowed: Option<Map<AllowedAddress, BN>>;
}

export function newTokenState(name: string, decimals: number, symbol: string, owner: BlockchainAddress, totalSupply: BN, balances: Option<Map<BlockchainAddress, BN>>, allowed: Option<Map<AllowedAddress, BN>>): TokenState {
  return {name, decimals, symbol, owner, totalSupply, balances, allowed};
}

function fromScValueTokenState(structValue: ScValueStruct): TokenState {
  return {
    name: structValue.getFieldValue("name")!.stringValue(),
    decimals: structValue.getFieldValue("decimals")!.asNumber(),
    symbol: structValue.getFieldValue("symbol")!.stringValue(),
    owner: BlockchainAddress.fromBuffer(structValue.getFieldValue("owner")!.addressValue().value),
    totalSupply: structValue.getFieldValue("total_supply")!.asBN(),
    balances: structValue.getFieldValue("balances")!.avlTreeMapValue().mapKeysValues((k1) => BlockchainAddress.fromBuffer(k1.addressValue().value), (v2) => v2.asBN()),
    allowed: structValue.getFieldValue("allowed")!.avlTreeMapValue().mapKeysValues((k3) => fromScValueAllowedAddress(k3.structValue()), (v4) => v4.asBN()),
  };
}

export function deserializeTokenState(state: StateBytes): TokenState {
  const scValue = new StateReader(state.state, fileAbi.contract, state.avlTrees).readState();
  return fromScValueTokenState(scValue);
}

export interface EventSubscriptionId {
  rawId: number;
}

export function newEventSubscriptionId(rawId: number): EventSubscriptionId {
  return {rawId};
}

function fromScValueEventSubscriptionId(structValue: ScValueStruct): EventSubscriptionId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export interface ExternalEventId {
  rawId: number;
}

export function newExternalEventId(rawId: number): ExternalEventId {
  return {rawId};
}

function fromScValueExternalEventId(structValue: ScValueStruct): ExternalEventId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export interface SecretVarId {
  rawId: number;
}

export function newSecretVarId(rawId: number): SecretVarId {
  return {rawId};
}

function fromScValueSecretVarId(structValue: ScValueStruct): SecretVarId {
  return {
    rawId: structValue.getFieldValue("raw_id")!.asNumber(),
  };
}

export function initialize(name: string, symbol: string, decimals: number, totalSupply: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("initialize", fileAbi.contract);
  fnBuilder.addString(name);
  fnBuilder.addString(symbol);
  fnBuilder.addU8(decimals);
  fnBuilder.addU128(totalSupply);
  return fnBuilder.getBytes();
}

export function transfer(to: BlockchainAddress, amount: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("transfer", fileAbi.contract);
  fnBuilder.addAddress(to.asBuffer());
  fnBuilder.addU128(amount);
  return fnBuilder.getBytes();
}

export function bulkTransfer(transfers: Transfer[]): Buffer {
  const fnBuilder = new FnRpcBuilder("bulk_transfer", fileAbi.contract);
  const vecBuilder5 = fnBuilder.addVec();
  for (const vecEntry6 of transfers) {
    buildRpcTransfer(vecEntry6, vecBuilder5);
  }
  return fnBuilder.getBytes();
}

export function transferFrom(from: BlockchainAddress, to: BlockchainAddress, amount: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("transfer_from", fileAbi.contract);
  fnBuilder.addAddress(from.asBuffer());
  fnBuilder.addAddress(to.asBuffer());
  fnBuilder.addU128(amount);
  return fnBuilder.getBytes();
}

export function bulkTransferFrom(from: BlockchainAddress, transfers: Transfer[]): Buffer {
  const fnBuilder = new FnRpcBuilder("bulk_transfer_from", fileAbi.contract);
  fnBuilder.addAddress(from.asBuffer());
  const vecBuilder7 = fnBuilder.addVec();
  for (const vecEntry8 of transfers) {
    buildRpcTransfer(vecEntry8, vecBuilder7);
  }
  return fnBuilder.getBytes();
}

export function approve(spender: BlockchainAddress, amount: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("approve", fileAbi.contract);
  fnBuilder.addAddress(spender.asBuffer());
  fnBuilder.addU128(amount);
  return fnBuilder.getBytes();
}

export function approveRelative(spender: BlockchainAddress, delta: BN): Buffer {
  const fnBuilder = new FnRpcBuilder("approve_relative", fileAbi.contract);
  fnBuilder.addAddress(spender.asBuffer());
  fnBuilder.addI128(delta);
  return fnBuilder.getBytes();
}

