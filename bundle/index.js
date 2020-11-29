var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (callback, module) => () => {
  if (!module) {
    module = {exports: {}};
    callback(module.exports, module);
  }
  return module.exports;
};
var __exportStar = (target, module, desc) => {
  __markAsModule(target);
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module) => {
  if (module && module.__esModule)
    return module;
  return __exportStar(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", {value: module, enumerable: true}), module);
};

// node_modules/react-storage-hooks/dist/common.js
var require_common = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var react_1 = require("react");
  function fromStorage(value) {
    return value !== null ? JSON.parse(value) : null;
  }
  function readItem(storage, key) {
    try {
      var storedValue = storage.getItem(key);
      return fromStorage(storedValue);
    } catch (e) {
      return null;
    }
  }
  function toStorage(value) {
    return JSON.stringify(value);
  }
  function writeItem(storage, key, value) {
    try {
      if (value !== null) {
        storage.setItem(key, toStorage(value));
      } else {
        storage.removeItem(key);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
  function useInitialState(storage, key, defaultState) {
    var defaultStateRef = react_1.useRef(defaultState);
    return react_1.useMemo(function() {
      var _a;
      return (_a = readItem(storage, key)) !== null && _a !== void 0 ? _a : defaultStateRef.current;
    }, [
      key,
      storage
    ]);
  }
  exports.useInitialState = useInitialState;
  function useStorageWriter(storage, key, state) {
    var _a = react_1.useState(void 0), writeError = _a[0], setWriteError = _a[1];
    react_1.useEffect(function() {
      writeItem(storage, key, state).catch(function(error) {
        if (!error || !error.message || error.message !== (writeError === null || writeError === void 0 ? void 0 : writeError.message)) {
          setWriteError(error);
        }
      });
      if (writeError) {
        return function() {
          setWriteError(void 0);
        };
      }
    }, [state, key, writeError, storage]);
    return writeError;
  }
  exports.useStorageWriter = useStorageWriter;
  function useStorageListener(storage, key, defaultState, onChange) {
    var defaultStateRef = react_1.useRef(defaultState);
    var onChangeRef = react_1.useRef(onChange);
    var firstRun = react_1.useRef(true);
    react_1.useEffect(function() {
      var _a;
      if (firstRun.current) {
        firstRun.current = false;
        return;
      }
      onChangeRef.current((_a = readItem(storage, key)) !== null && _a !== void 0 ? _a : defaultStateRef.current);
    }, [key, storage]);
    react_1.useEffect(function() {
      function onStorageChange(event) {
        var _a;
        if (event.key === key) {
          onChangeRef.current((_a = fromStorage(event.newValue)) !== null && _a !== void 0 ? _a : defaultStateRef.current);
        }
      }
      if (typeof window !== "undefined") {
        window.addEventListener("storage", onStorageChange);
        return function() {
          window.removeEventListener("storage", onStorageChange);
        };
      }
    }, [key]);
  }
  exports.useStorageListener = useStorageListener;
});

// node_modules/react-storage-hooks/dist/state.js
var require_state = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var react_1 = require("react");
  var common_1 = require_common();
  function useStorageState(storage, key, defaultState) {
    if (defaultState === void 0) {
      defaultState = null;
    }
    var _a = react_1.useState(common_1.useInitialState(storage, key, defaultState)), state = _a[0], setState = _a[1];
    common_1.useStorageListener(storage, key, defaultState, setState);
    var writeError = common_1.useStorageWriter(storage, key, state);
    return [state, setState, writeError];
  }
  exports.default = useStorageState;
});

// node_modules/react-storage-hooks/dist/reducer.js
var require_reducer = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var react_1 = require("react");
  var common_1 = require_common();
  var FORCE_STATE_ACTION = "__FORCE_STATE_INTERNAL_API__";
  function isForceStateAction(action) {
    return typeof action === "object" && action !== null && "type" in action && action.type === FORCE_STATE_ACTION;
  }
  function addForceStateActionToReducer(reducer) {
    return function(state, action) {
      if (isForceStateAction(action))
        return action.payload;
      return reducer(state, action);
    };
  }
  function useStorageReducer2(storage, key, reducer, defaultInitialArg, defaultInit) {
    if (defaultInit === void 0) {
      defaultInit = function(x) {
        return x;
      };
    }
    var defaultState = defaultInit(defaultInitialArg);
    var _a = react_1.useReducer(addForceStateActionToReducer(reducer), common_1.useInitialState(storage, key, defaultState)), state = _a[0], dispatch = _a[1];
    common_1.useStorageListener(storage, key, defaultState, function(newValue) {
      dispatch({type: FORCE_STATE_ACTION, payload: newValue});
    });
    var writeError = common_1.useStorageWriter(storage, key, state);
    return [state, dispatch, writeError];
  }
  exports.default = useStorageReducer2;
});

// node_modules/react-storage-hooks/dist/index.js
var require_dist = __commonJS((exports) => {
  "use strict";
  Object.defineProperty(exports, "__esModule", {value: true});
  var state_1 = require_state();
  exports.useStorageState = state_1.default;
  var reducer_1 = require_reducer();
  exports.useStorageReducer = reducer_1.default;
});

// src/index.ts
var react_storage_hooks = __toModule(require_dist());
import React from "react";
React;
react_storage_hooks.useStorageReducer;
