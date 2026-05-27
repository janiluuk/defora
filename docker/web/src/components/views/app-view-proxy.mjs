function hasOwnProp(props, key) {
  return Object.prototype.hasOwnProperty.call(props, key);
}

export function proxyAppView(props) {
  return new Proxy(
    {},
    {
      get(_target, key) {
        if (hasOwnProp(props, key) && key !== 'app') {
          return props[key];
        }
        const value = Reflect.get(props.app, key);
        if (typeof value === 'function') {
          return value.bind(props.app);
        }
        return value;
      },
      set(_target, key, value) {
        if (hasOwnProp(props, key) && key !== 'app') {
          return false;
        }
        Reflect.set(props.app, key, value);
        return true;
      },
      has(_target, key) {
        return (hasOwnProp(props, key) && key !== 'app') || key in props.app;
      },
      getOwnPropertyDescriptor(_target, key) {
        if (hasOwnProp(props, key) && key !== 'app') {
          return {
            configurable: true,
            enumerable: true,
            value: props[key],
            writable: false,
          };
        }
        return {
          configurable: true,
          enumerable: true,
          value: Reflect.get(props.app, key),
          writable: true,
        };
      },
    },
  );
}
