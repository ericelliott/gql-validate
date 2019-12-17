import { describe, Try } from "riteway";

import { gqlValidate } from "./validate.js";

describe("gqlValidate(): no config", async assert => {
  const rootType = "Person";
  const schema = `
    type ${rootType} {
      name: String!
      age: Int
      height: Float
      knowsJS: Boolean! 
    }
  `;

  {
    const validObj = {
      name: "Foobert",
      age: 25,
      height: 1.93,
      knowsJS: true
    };

    assert({
      given: "a schema and a valid object with all keys",
      should: "return an empty array",
      actual: await gqlValidate(schema, rootType, validObj),
      expected: []
    });
  }

  {
    const validObj = {
      name: "Bazey",
      knowsJS: true
    };

    assert({
      given: "a schema with a valid object leaving out optional keys",
      should: "return an empty array",
      actual: await gqlValidate(schema, rootType, validObj),
      expected: []
    });
  }

  {
    const validObj = {
      name: "Barry",
      knowsJS: false
    };
    const dispensibleArgument = "I shouldn't affect anything";

    assert({
      given: "a schema and a valid object, curried",
      should: "return an empty array",
      actual: await gqlValidate(schema, rootType)(
        validObj,
        dispensibleArgument
      ),
      expected: []
    });
  }

  {
    const invalidObj = {};

    assert({
      given: "a schema and an object with missing required params",
      should: "return an array containing the correct errors",
      actual: await gqlValidate(schema, rootType, invalidObj),
      expected: ["name is a required field", "knowsJS is a required field"]
    });
  }

  {
    const invalidObj = {
      name: 16,
      age: 16.87,
      height: true,
      knowsJS: "Yes"
    };

    assert({
      given: "a schema with an invalid object with wrong types",
      should: "return an array containing the correct errors",
      actual: await gqlValidate(schema, rootType, invalidObj),
      expected: [
        "name must be a `string` type, but the final value was: `16`.",
        "age must be an integer",
        "height must be a `number` type, but the final value was: `true`.",
        'knowsJS must be a `boolean` type, but the final value was: `"Yes"`.'
      ]
    });
  }

  {
    const schemaWithAddress = `
      type ${rootType} {
        name: String!
        id: EthereumAddress!
      }
    `;
    const validObj = {
      name: "Foobert",
      id: "0xad16d6d10e6acf06c6a17bd85cfb9f1d5467c644"
    };

    const error = await Try(gqlValidate, schemaWithAddress, rootType, validObj);

    assert({
      given: "a schema with a custom type and a valid object",
      should: "throw",
      actual: error.message,
      expected:
        "Please specify how to handle 'EthereumAddress' in your config to use it in your schema."
    });
  }

  {
    const emptySchema = "";
    const obj = { foo: "foo", bar: "bar" };

    assert({
      given: "an empty schema with any object",
      should: "return an empty array",
      actual: gqlValidate(emptySchema, rootType, obj),
      expected: []
    });
  }
});
