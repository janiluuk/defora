export function proxyAppView(props) {
  return new Proxy(
    {},
    {
      get(_target, key) {
        return Reflect.get(props.app, key);
      },
      set(_target, key, value) {
        Reflect.set(props.app, key, value);
        return true;
      },
      has(_target, key) {
        return key in props.app;
      },
      getOwnPropertyDescriptor(_target, key) {
        return {
          configurable: true,
          enumerable: true,
          value: Reflect.get(props.app, key),
          writable: true,
        };
      },
    }
  );
}
