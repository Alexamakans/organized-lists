// @ts-check

import express from "express";
import { getNumberParam, getNumberQuery, getStringQuery } from "../../util.mjs";
import { DB } from "../../db.mjs";

/** @typedef {import("../../types").Item} Item */

/**
 * @param {express.Express} app
 * @param {DB} db
 */
export function addEndpoints(app, db) {
  app.get("/api/v1/item", getItems.bind(undefined, db));
  app.get("/api/v1/item/:id", getItem.bind(undefined, db));
  app.post("/api/v1/item", postItem.bind(undefined, db));
  app.patch("/api/v1/item/:id", patchItem.bind(undefined, db));
  app.delete("/api/v1/item/:id", deleteItem.bind(undefined, db));
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getItems(db, req, res) {
  const limit = getNumberQuery(req, "limit", 100, 1, 1000);
  if (limit === null) {
    res.status(400).json({ error: "limit must be an integer [1, 1000]" });
    return;
  }
  const skip = getNumberQuery(req, "skip", 0, 0);
  if (skip === null) {
    res.status(400).json({ error: "skip must be an integer [0, +inf)" });
    return;
  }
  const name = getStringQuery(req, "name");
  if (name === null && req.params.name) {
    res
      .status(400)
      .json({ error: "name must be a non-empty string or undefined" });
    return;
  }

  /** @type Item[] */
  let items;
  if (typeof name === "string") {
    const nameRegex = new RegExp(name, "i");

    items = db
      .getItems()
      .filter((item) => nameRegex.test(item.name))
      .slice(skip, skip + limit);
  } else {
    items = db.getItems().slice(skip, skip + limit);
  }

  res.status(200).json(items);
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getItem(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }
  const item = db.getItem(id);
  if (!item) {
    res.status(404).json({ error: `item with id '${id}' not found` });
    return;
  }

  res.status(200).json(item);
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function postItem(db, req, res) {
  const item = req.body;
  try {
    const newItem = db.postItem(item);
    /* 201 CREATED */
    res.status(201).json(newItem);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function patchItem(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }

  const item = req.body;
  try {
    const newItem = db.patchItem(id, item);
    if (newItem === null) {
      res.status(404).json({ error: `item with id ${id} not found` });
      return;
    }
    /* 304 NOT MODIFIED */
    res.status(item === newItem ? 304 : 200).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteItem(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }
  if (db.deleteItem(id)) {
    /* 204 NO CONTENT */
    res.sendStatus(204);
  }
}
