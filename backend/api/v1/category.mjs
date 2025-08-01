// @ts-check

import express from "express";
import { getNumberParam, getNumberQuery, getStringQuery } from "../../util.mjs";
import { DB } from "../../db.mjs";

/** @typedef {import("../../types").Category} Category */

/**
 * @param {express.Express} app
 * @param {DB} db
 */
export function addEndpoints(app, db) {
  app.get("/api/v1/category", getCategories.bind(undefined, db));
  app.get("/api/v1/category/:id", getCategory.bind(undefined, db));
  app.post("/api/v1/category", postCategory.bind(undefined, db));
  app.patch("/api/v1/category/:id", patchCategory.bind(undefined, db));
  app.delete("/api/v1/category/:id", deleteCategory.bind(undefined, db));
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getCategories(db, req, res) {
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

  /** @type Category[] */
  let categories;
  if (typeof name === "string") {
    const nameRegex = new RegExp(name, "i");

    categories = db
      .getCategories()
      .filter((category) => nameRegex.test(category.name))
      .slice(skip, skip + limit);
  } else {
    categories = db.getCategories().slice(skip, skip + limit);
  }

  res.status(200).json(categories);
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function getCategory(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }
  const category = db.getCategory(id);
  if (!category) {
    res.status(404).json({ error: `category with id '${id}' not found` });
    return;
  }

  res.status(200).json(category);
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function postCategory(db, req, res) {
  const category = req.body;
  try {
    const newCategory = db.postCategory(category);
    /* 201 CREATED */
    res.status(201).json(newCategory);
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
function patchCategory(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }

  const category = req.body;
  try {
    const newCategory = db.patchCategory(id, category);
    if (newCategory === null) {
      res.status(404).json({ error: `category with id ${id} not found` });
      return;
    }
    /* 304 NOT MODIFIED */
    res.status(category === newCategory ? 304 : 200).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * @param {DB} db
 * @param {express.Request} req
 * @param {express.Response} res
 */
function deleteCategory(db, req, res) {
  const id = getNumberParam(req, "id", undefined, 0);
  if (id === null) {
    res.status(400).json({ error: `invalid id '${id}'` });
    return;
  }
  if (db.deleteCategory(id)) {
    /* 204 NO CONTENT */
    res.sendStatus(204);
  }
}
