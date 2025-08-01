// @ts-check

import express from "express";
import { getNumberParam, getNumberQuery, getStringQuery } from "../../util.mjs";
import { DB } from "../../db.mjs";

/** @typedef {import("../../types").List} List */

/**
 * @param {express.Express} app
 * @param {DB} db
 */
export function addEndpoints(app, db) {
  app.get("/api/v1/list", getLists.bind(undefined, db));
  app.get("/api/v1/list/:id", getList.bind(undefined, db));
  app.post("/api/v1/list", postList.bind(undefined, db));
  app.patch("/api/v1/list/:id", patchList.bind(undefined, db));
  app.delete("/api/v1/list/:id", deleteList.bind(undefined, db));
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getLists(db, req, res) {
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

  /** @type List[] */
  let lists;
  if (typeof name === "string") {
    const nameRegex = new RegExp(name);

    lists = db
      .getLists()
      .filter((list) => nameRegex.test(list.name))
      .slice(skip, skip + limit);
  } else {
    lists = db.getLists().slice(skip, skip + limit);
  }

  res.status(200).json(lists);
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getList(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }
  const list = db.getList(id);
  if (!list) {
    res.status(404).json({ error: `list with id '${id}' not found` });
    return;
  }

  res.status(200).json(list);
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function postList(db, req, res) {
  const list = req.body;
  try {
    const newList = db.postList(list);
    /* 201 CREATED */
    res.status(201).json(newList);
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
function patchList(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }

  const list = req.body;
  try {
    const newList = db.patchList(id, list);
    if (newList === null) {
      res.status(404).json({ error: `list with id ${id} not found` });
      return;
    }
    /* 304 NOT MODIFIED */
    res.status(list === newList ? 304 : 200).json(newList);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteList(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }
  if (db.deleteList(id)) {
    /* 204 NO CONTENT */
    res.sendStatus(204);
  }
}
