declare module 'json-6' {
  interface JSON6Static {
    parse: (text: string, reviver?: (key: string, value: unknown) => unknown) => unknown;
    stringify: (
      value: unknown,
      replacer?: ((key: string, value: unknown) => unknown) | (string | number)[] | null,
      space?: string | number
    ) => string;
  }
  const JSON6: JSON6Static;
  export default JSON6;
}
