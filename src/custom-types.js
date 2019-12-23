import { isAddress, isHex } from "web3-utils";
import * as yup from "yup";

const Email = yup
  .string()
  .strict()
  .email();

const EthereumAddress = yup
  .string()
  .strict()
  .test("is-address", "${path} must be a valid Ethereum address", isAddress);

const EthereumSignature = yup.object().shape({
  messageHash: yup
    .string()
    .strict()
    .test("is hash", "${path} must be a hex hash", isHex)
    .required(),
  r: yup
    .string()
    .strict()
    .test("is hex", "${path} must be a valid hex value", isHex)
    .length(66)
    .required(),
  s: yup
    .string()
    .strict()
    .test("is hex", "${path} must be a valid hex value", isHex)
    .length(66)
    .required(),
  v: yup
    .string()
    .strict()
    .test("is hex", "${path} must be a valid hex value", isHex)
    .length(4)
    .required()
});

const TokenData = yup.object().shape({
  name: yup
    .string()
    .strict()
    .required(),
  id: yup
    .string()
    .strict()
    .required()
});

export { Email, EthereumAddress, EthereumSignature, TokenData };
