import { describe } from "riteway";

import validate from "./validate.js";

describe("validate", async assert => {
  {
    const requiredSchema = `
    interface RegisterForm{
    	name : String!
    	email : String!
    	organization : String
    	jobTitle : String
    }`;

    const data = {};

    assert({
      given: "missing required props",
      should: "return a list of validation errors",
      actual: validate(requiredSchema, "RegisterForm", data).length,
      expected: 2
    });
  }

  {
    const requiredSchema = `
    interface RegisterForm{
    	name : String
    	email : String
    	organization : String
    	jobTitle : String
    }`;

    const data = {};

    assert({
      given: "no required props",
      should: 'return no "missing required" validation errors',
      actual: validate(requiredSchema, "RegisterForm", data).length,
      expected: 0
    });
  }
});
