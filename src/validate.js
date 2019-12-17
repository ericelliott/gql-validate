import createSchema from "graphql-to-json-schema";
import produce from "immer";
import * as yup from "yup";

const curry = (f, arr = []) => (...args) =>
  (a => (a.length >= f.length ? f(...a) : curry(f, a)))([...arr, ...args]);

const migrate = schema =>
  produce(schema, draft => {
    draft["$schema"] = "http://json-schema.org/draft-07/schema#";
  });

const getPropRules = ({ definitions }, rootType) =>
  Object.entries(definitions[rootType].properties);

const handleType = (config, type, required, ref, items) => {
  if (type === "array") {
    const { type: t, $ref, required: req, items: i } = items.type;
    const schema = handleType(config, t, req, $ref, i);
    const array = config[type].of(schema);
    return required ? array.required() : array;
  }

  if (!type) {
    const customType = ref.substring(14);
    if (config[customType]) {
      if (typeof config[customType].resolve !== "function") {
        throw new Error(`${customType} must be a yup validator.`);
      }
      return required ? config[customType].required() : config[customType];
    }

    throw new Error(
      `Please specify how to handle '${customType}' in your config to use it in your schema.`
    );
  }

  return required ? config[type].required() : config[type];
};

const buildYupObjectFromSchema = (config, schema, rootType) =>
  yup.object().shape(
    getPropRules(schema, rootType).reduce(
      (shape, [key, { type, required, $ref, items }]) => ({
        ...shape,
        [key]: handleType(config, type, required, $ref, items)
      }),
      {}
    )
  );

const yupValidate = async (yupObj, data = {}) =>
  await yupObj
    .validate(data, { abortEarly: false })
    .then(() => [])
    .catch(({ errors }) => errors);

const defaultConfig = {
  string: yup.string().strict(),
  integer: yup
    .number()
    .integer()
    .strict(),
  number: yup.number().strict(),
  boolean: yup.boolean().strict(),
  array: yup.array()
};

const configureGqlValidate = (config = {}) => {
  const configuration = { ...defaultConfig, ...config };

  /**
   * Validate a JavaScript object against a GraphQL schema.
   *
   * Supported features: required and custom types using yup.
   *
   * @param  {string} gqlSchema   - A GraphQL schema.
   * @param  {string} rootType - The root type of the data object to validate.
   * @param  {object} data     - The object to validate.
   * @returns {Array}          An array of errors.
   */
  const gqlValidate = curry(async (gqlSchema, rootType, data) => {
    if (gqlSchema === "") return [];
    const draft4Schema = createSchema(gqlSchema);
    const schema = migrate(draft4Schema);
    const yupObject = buildYupObjectFromSchema(configuration, schema, rootType);
    return await yupValidate(yupObject, data);
  });

  return gqlValidate;
};

const gqlValidate = configureGqlValidate();

export default configureGqlValidate;
export { gqlValidate };
