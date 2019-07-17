import createSchema from "graphql-to-json-schema";
import produce from "immer";
const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

const getPropRules = ({ definitions }, key) =>
  pipe(
    () => definitions[key].properties,
    Object.values
  )();

const jsonValidate = (schema, rootType, data) =>
  getPropRules(schema, rootType).reduce((errors, { title, required }) => {
    return required && !data[title]
      ? errors.concat(`${title} is required`)
      : errors;
  }, []);

const migrate = schema =>
  produce(schema, draft => {
    draft["$schema"] = "http://json-schema.org/draft-07/schema#";
  });

/**
 * Validate a JavaScript object against a GraphQL schema.
 *
 * Supported features: required.
 *
 * @param  {string} gqlSchema   - A GraphQL schema.
 * @param  {string} rootType - The root type of the data object to validate.
 * @param  {object} data     - The object to validate.
 * @returns {Array}          An array of errors.
 */
const validate = (gqlSchema, rootType, data) => {
  // https://app.graphqleditor.com/
  const draft4Schema = createSchema(gqlSchema);
  const schema = migrate(draft4Schema);
  return jsonValidate(schema, rootType, data);
};

export default validate;
