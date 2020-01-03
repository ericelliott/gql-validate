import { describe, Try } from "riteway";

import { Email, EthereumAddress, TokenData } from "./custom-types.js";
import configureGqlValidate from "./index.js";

describe("gqlValidate(): with valid custom types", async assert => {
  const config = { Email, EthereumAddress };
  const gqlValidate = configureGqlValidate(config);
  const rootType = "Issuer";
  const schema = `
    type ${rootType} {
      name: String
      email: Email!
      address: EthereumAddress!
    }
  `;

  {
    const validObj = {
      address: "0xad16d6d10e6acf06c6a17bd85cfb9f1d5467c644",
      email: "foo@example.com",
      name: "Foobert"
    };

    assert({
      given: "a schema with custom types and a valid object",
      should: "return an empty array",
      actual: await gqlValidate(schema, rootType, validObj),
      expected: []
    });
  }

  {
    const invalidObj = {
      address: "abc",
      email: "Foobert"
    };

    assert({
      given: "a schema with custom types and an invalid object",
      should: "return an array containing the correct errors",
      actual: await gqlValidate(schema, rootType, invalidObj),
      expected: [
        "email must be a valid email",
        "address must be a valid Ethereum address"
      ]
    });
  }
});

describe("gqlValidate(): with array", async assert => {
  const config = { TokenData };
  const validate = configureGqlValidate(config);
  const rootType = "Params";
  const schema = `
    type TokenData {
      name: String!
      id: String!
    }
    type ${rootType} {
      message: String!
      numbers: [Int!]!
      strings: [String!]!
      tokens: [TokenData!]!
    }
  `;

  {
    const token = { name: "foo", id: "123" };
    const validObj = {
      message: "bar",
      numbers: [4],
      tokens: [token],
      strings: ["foo"]
    };

    assert({
      given: "a valid object",
      should: "return an empty array",
      actual: await validate(schema, rootType, validObj),
      expected: []
    });
  }

  {
    const invalidObj = { message: "foo", numbers: [], tokens: [], strings: [] };

    assert({
      given: "an invalid object (empty array)",
      should: "return an array containing the corresponding error",
      actual: await validate(schema, rootType, invalidObj),
      expected: [
        "numbers is a required field",
        "strings is a required field",
        "tokens is a required field"
      ]
    });
  }

  {
    const invalidObj = {
      message: "hello",
      numbers: ["hello"],
      strings: [1],
      tokens: [{ name: 1, id: true }]
    };

    assert({
      given: "an invalid object (wrong types)",
      should: "return an array containing the corresponding error",
      actual: await validate(schema, rootType, invalidObj),
      expected: [
        'numbers[0] must be a `number` type, but the final value was: `"hello"`.',
        "strings[0] must be a `string` type, but the final value was: `1`.",
        "tokens[0].name must be a `string` type, but the final value was: `1`.",
        "tokens[0].id must be a `string` type, but the final value was: `true`."
      ]
    });
  }
});

describe("gqlValidate(): with invalid custom types", async assert => {
  const invalidConfig = { Wrong: {} };
  const gqlValidate = configureGqlValidate(invalidConfig);
  const rootType = "Wrong";
  const schema = `
      type ${rootType} {
        wrong: Wrong!
      }
    `;
  const obj = { wrong: "" };

  const error = await Try(gqlValidate, schema, rootType, obj);

  assert({
    given: "an invalid configuration object",
    should: "throw",
    actual: error.message,
    expected: `${rootType} must be a yup validator.`
  });
});
