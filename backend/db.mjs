// @ts-check

import assert from "assert";
import fs from "fs";

/** @typedef {import("./types").Category} Category */
/** @typedef {import("./types").CategoryPartial} CategoryPartial */
/** @typedef {import("./types").List} List */
/** @typedef {import("./types").ListPartial} ListPartial */
/** @typedef {import("./types").ListRef} ListRef */
/** @typedef {import("./types").Item} Item */
/** @typedef {import("./types").ItemPartial} ItemPartial */
/** @typedef {import("./types").ItemRef} ItemRef */

/**
 * @typedef {Object} Data
 * @property {Category[]} categories
 * @property {number} nextCategoryId
 * @property {Item[]} items
 * @property {number} nextItemId
 * @property {List[]} lists
 * @property {number} nextListId
 */

export class DB {
  /**
   * @param {string} filepath
   * @throws {Error}
   */
  constructor(filepath) {
    this.assertNonEmptyString(filepath, "filepath");
    this.filepath = filepath;
    if (!this.load()) {
      /**
       * @type {Data} data
       */
      this.data = {
        categories: [],
        nextCategoryId: 0,
        items: [],
        nextItemId: 0,
        lists: [],
        nextListId: 0,
      };

      this.save();
    }
  }

  /**
   * @returns boolean - Returns false in addition to logging an error if it fails.
   */
  save() {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(this.data));
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  }

  /**
   * @returns boolean - Returns false if file does not exist.
   * @throws {Error}
   */
  load() {
    try {
      const content = fs.readFileSync(this.filepath, "utf-8");
      this.data = JSON.parse(content);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error(err);
      }
      return false;
    }
    return true;
  }

  /**
   * @returns Category[]
   */
  getCategories() {
    return this.data.categories;
  }

  /**
   * @param {Category} category
   * @returns Category
   * @throws {Error}
   */
  postCategory(category) {
    this.assertValidObject(category, "category");
    this.assertNonEmptyString(category.name, "name");
    const createdAt = new Date();
    const modifiedAt = createdAt;

    const newCategory = {
      id: this.data.nextCategoryId++,
      name: category.name,
      createdAt,
      modifiedAt,
    };
    this.assertValidCategory(newCategory, "category");
    this.data.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  /**
   * @param {number} id
   * @param {CategoryPartial} category
   * @returns Category
   * @throws {Error}
   */
  patchCategory(id, category) {
    this.assertValidId(id);
    this.assertValidObject(category);
    const existing = this.data.categories.find((e) => e.id === id);
    if (!existing) {
      return null;
    }
    let modified = false;
    if (category.name) {
      existing.name = category.name;
      modified = true;
    }
    if (modified) {
      existing.modifiedAt = new Date();
      this.assertValidCategory(existing, `update category with id ${id}`);
      this.save();
    }
    return existing;
  }

  /**
   * @param {number} id
   * @returns boolean
   * @throws {Error}
   */
  deleteCategory(id) {
    this.assertValidId(id);
    const index = this.data.categories.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    this.data.categories.splice(index, 1);
    this.save();
    return true;
  }

  /**
   * @param {number} id
   * @returns Category
   * @throws {Error}
   */
  getCategory(id) {
    this.assertValidId(id);
    return this.data.categories.find((category) => category.id === id);
  }

  /**
   * @returns Item[]
   */
  getItems() {
    return this.data.items;
  }

  /**
   * @param {ItemPartial} item
   * @returns {Item}
   * @throws {Error}
   */
  postItem(item) {
    this.assertValidObject(item);
    this.assertNonEmptyString(item.name, "name");
    const name = /** @type {string} */ (item.name);
    if (!item.categoryIds) {
      item.categoryIds = [];
    }
    item.categoryIds.forEach((categoryId) =>
      assert(
        this.getCategory(categoryId),
        `category with id ${categoryId} not found`,
      ),
    );
    const createdAt = new Date(),
      modifiedAt = createdAt;
    const newItem = {
      id: this.data.nextItemId++,
      name: name,
      categoryIds: item.categoryIds || [],
      createdAt,
      modifiedAt,
    };
    this.assertValidItem(newItem, "new item");
    this.data.items.push(newItem);
    this.save();
    return newItem;
  }

  /**
   * @param {number} id
   * @param {ItemPartial} item
   * @returns Item
   * @throws {Error}
   */
  patchItem(id, item) {
    this.assertValidId(id);
    this.assertValidObject(item);
    const existing = this.data.items.find((e) => e.id === id);
    if (!existing) {
      return null;
    }
    let modified = false;
    if (item.name) {
      existing.name = item.name;
      modified = true;
    }
    if (item.categoryIds) {
      existing.categoryIds = item.categoryIds;
      modified = true;
    }
    if (modified) {
      existing.modifiedAt = new Date();
      this.assertValidItem(existing, `update item with id ${id}`);
      this.save();
    }
    return existing;
  }

  /**
   * @param {number} id
   * @returns boolean
   * @throws {Error}
   */
  deleteItem(id) {
    this.assertValidId(id);
    const index = this.data.items.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    this.data.items.splice(index, 1);
    this.save();
    return true;
  }

  /**
   * @param {number} id
   * @returns Item
   * @throws {Error}
   */
  getItem(id) {
    this.assertValidId(id);
    return this.data.items.find((item) => item.id === id);
  }

  /**
   * @returns List[]
   */
  getLists() {
    return this.data.lists;
  }

  /**
   * @param {List} list
   * @returns List
   * @throws {Error}
   */
  postList(list) {
    this.assertValidObject(list);
    this.assertNonEmptyString(list.name, "name");
    list.itemRefs?.forEach((ref, i) =>
      this.assertValidItemRef(ref, `itemRef index ${i}`),
    );
    list.listRefs?.forEach((ref, i) =>
      this.assertValidListRef(ref, `listRef index ${i}`),
    );
    const createdAt = new Date(),
      modifiedAt = createdAt;
    const newList = {
      id: this.data.nextListId++,
      name: list.name,
      createdAt,
      modifiedAt,
      itemRefs: list.itemRefs || [],
      listRefs: list.listRefs || [],
    };
    this.assertValidList(newList, "new list");
    this.data.lists.push(newList);
    this.save();
    return newList;
  }

  /**
   * @param {number} id
   * @param {ListPartial} list
   * @returns List
   * @throws {Error}
   */
  patchList(id, list) {
    this.assertValidId(id);
    assert(list !== null && typeof list === "object");
    const patched = this.data.lists.find((e) => e.id === id);
    if (!patched) {
      return null;
    }
    let modified = false;
    if (list.name) {
      patched.name = list.name;
      modified = true;
    }
    if (list.itemRefs) {
      patched.itemRefs = list.itemRefs;
      modified = true;
    }
    if (list.listRefs) {
      patched.listRefs = list.listRefs;
      modified = true;
    }
    if (modified) {
      patched.modifiedAt = new Date();
      this.assertValidList(patched, `update list with id ${id}`);
      this.save();
    }
    return patched;
  }

  /**
   * @param {number} id
   * @returns boolean - True if deleted, false if didn't exist.
   * @throws {Error}
   */
  deleteList(id) {
    this.assertValidId(id);
    const index = this.data.lists.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }
    this.data.lists.splice(index, 1);
    this.save();
    return true;
  }

  /**
   * @param {number} id
   * @returns List
   * @throws {Error}
   */
  getList(id) {
    this.assertValidId(id);
    return this.data.lists.find((e) => e.id === id);
  }

  /**
   * @param {Category} category
   * @param {string} messageHeader
   * @throws {Error}
   */
  assertValidCategory(category, messageHeader) {
    this.assertValidId(category.id, messageHeader);
    this.assertNonEmptyString(category.name, `${messageHeader}: name`);

    this.assertValidCreatedAndModifiedAt(category, messageHeader);
  }

  /**
   * @param {Item | ItemPartial} item
   * @param {string} messageHeader
   * @throws {Error}
   */
  assertValidItem(item, messageHeader) {
    this.assertValidId(item.id, messageHeader);
    this.assertNonEmptyString(item.name, `${messageHeader}: name`);
    assert(
      !item.categoryIds?.some(
        (categoryId) =>
          categoryId < 0 || this.getCategory(categoryId) === undefined,
      ),
    );

    this.assertValidCreatedAndModifiedAt(item, messageHeader);
  }

  /**
   * @param {List} list
   * @param {string} messageHeader
   * @throws {Error}
   */
  assertValidList(list, messageHeader) {
    this.assertValidId(list.id, messageHeader);
    this.assertNonEmptyString(list.name, `${messageHeader}: name`);

    assert(
      list.listRefs instanceof Array,
      `${messageHeader}: listRefs not an Array`,
    );
    assert(
      list.listRefs.every((ref, i) =>
        this.assertValidListRef(ref, `${messageHeader}: listRef index ${i}`),
      ),
    );

    assert(
      list.itemRefs instanceof Array,
      `${messageHeader}: itemRefs not an Array`,
    );
    assert(
      list.itemRefs.every((ref, i) =>
        this.assertValidItemRef(ref, `${messageHeader}: itemRef index ${i}`),
      ),
    );

    // not self-referencing
    assert(
      !list.listRefs.some((e) => e.listId === list.id),
      `${messageHeader}: circular reference`,
    );

    this.assertValidCreatedAndModifiedAt(list, messageHeader);
  }

  /**
   * @param {ListRef} listRef
   * @param {string} messageHeader
   * @throws {Error}
   */
  assertValidListRef(listRef, messageHeader) {
    this.assertValidId(listRef.listId, messageHeader);
    this.assertValidCount(listRef.count, messageHeader);
    assert(this.getLists().some((e) => e.id === listRef.listId));

    this.assertValidCreatedAndModifiedAt(listRef, messageHeader);
  }

  /**
   * @param {ItemRef} itemRef
   * @param {string} messageHeader
   * @throws {Error}
   */
  assertValidItemRef(itemRef, messageHeader) {
    this.assertValidId(itemRef.itemId, messageHeader);
    this.assertValidCount(itemRef.count, messageHeader);
    assert(
      this.getItems().some((e) => e.id === itemRef.itemId),
      `${messageHeader}: references invalid item id`,
    );
    this.assertValidCreatedAndModifiedAt(itemRef, messageHeader);
  }

  /**
   * @param {Category | CategoryPartial | Item | ItemPartial | List | ListPartial} obj
   * @param {string} [messageHeader]
   * @throws {Error}
   */
  assertValidCreatedAndModifiedAt(obj, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(obj.modifiedAt instanceof Date, `${base}modifiedAt: not a Date`);
    assert(obj.createdAt instanceof Date, `${base}createdAt: not a Date`);
    assert(
      obj.createdAt <= obj.modifiedAt,
      `${base}createdAt is later than modifiedAt`,
    );
  }

  /**
   * @param {*} obj
   * @param {string} [messageHeader]
   * @throws {Error}
   */
  assertValidObject(obj, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(
      obj !== null && obj !== undefined && typeof obj === "object",
      `${base}not an object`,
    );
  }

  /**
   * @param {any} id
   * @param {string} [messageHeader]
   * @throws {Error}
   */
  assertValidId(id, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(typeof id === "number", `${base}id not a number`);
    assert(id >= 0, `${base}id was < 0`);
  }

  /**
   * @param {number} count
   * @param {string} [messageHeader]
   * @throws {Error}
   */
  assertValidCount(count, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(typeof count === "number", `${base}count not a number`);
    assert(count >= 1, `${base}count was < 1`);
  }

  /**
   * @param {*} s
   * @param {string} [messageHeader]
   * @throws {Error}
   */
  assertNonEmptyString(s, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(s !== null, `${base}is null`);
    assert(s !== undefined, `${base}is undefined`);
    assert(typeof s === "string", `${base}not a string`);
    assert(s !== "", `${base}was empty`);
  }
}
