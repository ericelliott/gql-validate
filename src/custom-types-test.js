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
      tokens: [TokenData!]!
    }
  `;

  {
    const token = { name: "foo", id: "123" };
    const validObj = { message: "hello", numbers: [4], tokens: [token] };

    assert({
      given: "a valid object",
      should: "return an empty array",
      actual: await validate(schema, rootType, validObj),
      expected: []
    });
  }

  {
    const invalidObj = { message: "hello", numbers: [], tokens: [] };

    assert({
      given: "an invalid object (empty array)",
      should: "return an array containing the corresponding error",
      actual: await validate(schema, rootType, invalidObj),
      expected: ["numbers is a required field", "tokens is a required field"]
    });
  }

  {
    const invalidObj = {
      message: "hello",
      numbers: ["hello"],
      tokens: [{ name: 1, id: true }]
    };

    assert({
      given: "an invalid object (empty array)",
      should: "return an array containing the corresponding error",
      actual: await validate(schema, rootType, invalidObj),
      /*
      There are errors missing here for getting the type of name and id
      wrong. This is a bug from yup.
      See: https://github.com/jquense/yup/issues/725.
      */
      expected: [
        'numbers[0] must be a `number` type, but the final value was: `NaN` (cast from the value `"hello"`).'
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
