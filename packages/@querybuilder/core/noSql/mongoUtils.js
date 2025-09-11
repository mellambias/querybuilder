function jsonReplacer(key, value) {
  if (value instanceof RegExp) {
    return { __regex: true, pattern: value.source, flags: value.flags };
  }
  return value;
}

function jsonReviver(key, value) {
  if (value?.__regex) {
    return new RegExp(value.pattern, value.flags);
  }
  return value;
}

export { jsonReplacer, jsonReviver };
