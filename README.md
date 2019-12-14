# gql-validate

Validate a JS object against a GraphQL schema


## Status - Developer Preview

Currently, this only checks that required properties are present. It does not check that the type of each property is correct, nor does it run custom validations for user-created types.


## Usage

```js
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
validate(schema, rootType, validPerson);
// []
validate(schema, rootType)(invalidPerson);
// [
//   "'name' is required",
//   "'knowsJS' must be of type boolean, received string",
//   "'age' must be of type integer, received float"
// ]
```

By default `validate` understands the native [GraphQL scalars](https://graphql.org/learn/schema/#scalar-types). By default ID is just a string, so there is no validation for uniqueness. See `configureGqlValidate` for supporting custom types or to change the validation of existing types.


## API

### validate(gqlSchema, rootType, data) ⇒ <code>Array</code>

Validate a JavaScript object against a GraphQL schema. This function is curried.

Supported features: GraphQL scalars and required.

**Returns**: <code>Array</code> - An array of errors.  

| Param | Type | Description |
| --- | --- | --- |
| gqlSchema | <code>string</code> | A GraphQL schema. |
| rootType | <code>string</code> | The root type of the data object to validate. |
| data | <code>object</code> | The object to validate. |


### configureGqlValiadte(config) => <code>validate</code>

Configure the validation methods for the default and custom types for the `validate` function.

**Returns**: <code>validate</code> - The validate function.

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | A object which keys represent the type and value represent the validation object. The validation object must expose a `.validate()` method which takes in the key and its value and returns an array containing the error or an empty array. |

#### Usage

```js
const LongString = { 
  validate: (key, value) => typeof value === 'string' && value.length > 10
    ? []
    : [`'${key}' must be long string`]
};
const config = { LongString };
const validate = configureGqlValidate(config);

const rootType = 'Message';
const schema = `
  type ${rootType} {
    content: LongString!
  }
`;
const validMessage = { content: "I'm long enough." };
const invalidMessage = { content: 'Too short.' };
valiadate(schema, rootType, validMessage);
// []
validate(schema, rootType, invalidMessage);
// ["'content' must be a long string"]
```
