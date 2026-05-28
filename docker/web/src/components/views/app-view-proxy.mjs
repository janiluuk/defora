function hasOwnProp(props, key) {
  return Object.prototype.hasOwnProperty.call(props, key);
}

export function proxyAppView(props) {
  return new Proxy(
    {},
    {
      get(_target, key) {
        if (key === 'app' && hasOwnProp(props, 'app')) {
          return props.app;
        }
        if (hasOwnProp(props, key) && key !== 'app') {
          return props[key];
        }
        if (props.app == null) return undefined;
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
        if (key === 'app' && hasOwnProp(props, 'app')) return true;
        return (hasOwnProp(props, key) && key !== 'app') || (props.app != null && key in props.app);
      },
      getOwnPropertyDescriptor(_target, key) {
        if (key === 'app' && hasOwnProp(props, 'app')) {
          return {
            configurable: true,
            enumerable: true,
            value: props.app,
            writable: false,
          };
        }
        if (hasOwnProp(props, key) && key !== 'app') {
          return {
            configurable: true,
            enumerable: true,
            value: props[key],
            writable: false,
          };
        }
        if (props.app == null) return undefined;
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
