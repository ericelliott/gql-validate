# gql-validate

Validate a JS object against a GraphQL schema using [yup](https://github.com/jquense/yup) for validation.


## Status - Developer Preview

Currently, this checks that required properties are present, handles the GraphQL primitives and supports custom types. Arrays suffer from [this yup bug](https://github.com/jquense/yup/issues/725). You have to implement nested objects as custom types. See [`custom-types-test.js`](./src/custom-types-test.js) for examples.


## Usage

```js
import { gqlValidate } from 'gql-validate';

const rootType = 'Person';
const schema = `
  type ${rootType} {
    name: String!
    knowsJS: Boolean!
    age: Int
    height: Float
  }
`;
const validPerson = {
  name: 'Alice',
  knowsJS: true,
  age: 42
};
const invalidPerson = {
  knowsJS: "Yes"
  age: 10.5,
};
gqlValidate(schema, rootType, validPerson).then(console.log);
// []
gqlValidate(schema, rootType)(invalidPerson).then(console.log);
// [
//   "'name' is required",
//   "'knowsJS' must be of type boolean, received string",
//   "'age' must be of type integer, received float"
// ]
```

By default `validate` understands the native [GraphQL scalars](https://graphql.org/learn/schema/#scalar-types). By default ID is just a string, so there is no validation for uniqueness. See `configureGqlValidate` for supporting custom types or to change the validation of existing types.


## API

### gqlValidate(gqlSchema, rootType, data) ⇒ <code>Promise< Array ></code>

Validate a JavaScript object against a GraphQL schema. This function is curried.

Supported features: GraphQL scalars and required.

**Returns**: <code>Promise< Array ></code> - A promise with an array of errors.  

| Param | Type | Description |
| --- | --- | --- |
| gqlSchema | <code>string</code> | A GraphQL schema. |
| rootType | <code>string</code> | The root type of the data object to validate. |
| data | <code>object</code> | The object to validate. |


### configureGqlValidate(config) => <code>validate</code>

Configure the validation methods for the default and custom types for the `validate` function.

**Returns**: <code>validate</code> - The validate function.

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The keys of the validation object represent the GraphQL type. The values must be yup objects. |

#### Usage

```js
import configureGqlValidate from 'gql-validate';

const Email = yup.string().strict().email();
const config = { Email };
const validate = configureGqlValidate(config);

const rootType = 'Message';
const schema = `
  type ${rootType} {
    from: Email!
  }
`;
const validMessage = { from: "foo@example.com" };
const invalidMessage = { from: 'Bob' };
valiadate(schema, rootType, validMessage).then(console.log);
// []
validate(schema, rootType, invalidMessage).then(console.log);
// ["from must be a valid email"]
```
