// @ts-check

import assert from "assert";
import express from "express";

/**
 * @param {express.Request} req
 * @param {string} name
 * @param {number} [defaultValue]
 * @param {number} [minimum]
 * @param {number} [maximum]
 * @returns number?
 */
export function getNumberParam(
  req,
  name,
  defaultValue = undefined,
  minimum = undefined,
  maximum = undefined,
) {
  let svalue = req.params[name];
  /** @type number */
  let value;
  if (svalue === undefined && defaultValue !== undefined) {
    assert(typeof defaultValue === "number");
    value = defaultValue;
  } else {
    value = Number(svalue);
  }
  if (
    isNaN(value) ||
    (minimum !== undefined && value < minimum) ||
    (maximum !== undefined && value > maximum)
  ) {
    return null;
  }
  return value;
}

/**
 * @param {express.Request} req
 * @param {string} name
 * @param {string} [defaultValue]
 * @param {boolean} [allowEmpty]
 * @returns string?
 */
export function getStringParam(
  req,
  name,
  defaultValue = undefined,
  allowEmpty = false,
) {
  let value = req.params[name];
  if (value === undefined && defaultValue !== undefined) {
    value = defaultValue;
  }
  if (!allowEmpty && value === "") {
    return null;
  }
  return value;
}

/**
 * @param {express.Request} req
 * @param {string} name
 * @param {number} [defaultValue]
 * @param {number} [minimum]
 * @param {number} [maximum]
 * @returns number?
 */
export function getNumberQuery(
  req,
  name,
  defaultValue = undefined,
  minimum = undefined,
  maximum = undefined,
) {
  let svalue = req.query[name];
  /** @type number */
  let value;
  if (svalue === undefined && defaultValue !== undefined) {
    assert(typeof defaultValue === "number");
    value = defaultValue;
  } else {
    value = Number(svalue);
  }
  if (
    isNaN(value) ||
    (minimum !== undefined && value < minimum) ||
    (maximum !== undefined && value > maximum)
  ) {
    return null;
  }
  return value;
}

/**
 * @param {express.Request} req
 * @param {string} name
 * @param {string} [defaultValue]
 * @param {boolean} [allowEmpty]
 * @returns string?
 */
export function getStringQuery(
  req,
  name,
  defaultValue = undefined,
  allowEmpty = false,
) {
  let value = req.query[name];
  if (value === undefined && defaultValue !== undefined) {
    value = defaultValue;
  }
  value = value?.toString();
  if (!allowEmpty && value === "") {
    return null;
  }
  return value;
}
