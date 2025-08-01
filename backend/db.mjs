// @ts-check

import assert from "assert";
import fs from "fs";

/** @typedef {import("./types").Category} Category */
/** @typedef {import("./types").CategoryPatch} CategoryPatch */
/** @typedef {import("./types").List} List */
/** @typedef {import("./types").ListPatch} ListPatch */
/** @typedef {import("./types").ListRef} ListRef */
/** @typedef {import("./types").Item} Item */
/** @typedef {import("./types").ItemPatch} ItemPatch */
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
   * @returns boolean
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
   * @returns boolean
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
   */
  postCategory(category) {
    assert(category !== null && typeof category === "object", "not an object");
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
   * @param {CategoryPatch} category
   */
  patchCategory(id, category) {
    this.assertValidId(id);
    assert(category !== null && typeof category === "object", "not an object");
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
   * @param {Item} item
   */
  postItem(item) {
    assert(item !== null && typeof item === "object", "not an object");
    this.assertNonEmptyString(item.name, "name");
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
      name: item.name,
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
   * @param {ItemPatch} item
   */
  patchItem(id, item) {
    this.assertValidId(id);
    assert(item !== null && typeof item === "object", "not an object");
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
   */
  postList(list) {
    assert(list !== null && typeof list === "object", "not an object");
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
   * @param {ListPatch} list
   */
  patchList(id, list) {
    this.assertValidId(id);
    assert(list !== null && typeof list === "object");
    const existing = this.data.lists.find((e) => e.id === id);
    if (!existing) {
      return null;
    }
    let modified = false;
    if (list.name) {
      existing.name = list.name;
      modified = true;
    }
    if (list.itemRefs) {
      existing.itemRefs = list.itemRefs;
      modified = true;
    }
    if (list.listRefs) {
      existing.listRefs = list.listRefs;
      modified = true;
    }
    if (modified) {
      existing.modifiedAt = new Date();
      this.assertValidList(existing, `update list with id ${id}`);
      this.save();
    }
    return existing;
  }

  /**
   * @param {number} id
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
   */
  getList(id) {
    this.assertValidId(id);
    return this.data.lists.find((e) => e.id === id);
  }

  /**
   * @param {Category} category
   * @param {string} messageHeader
   */
  assertValidCategory(category, messageHeader) {
    this.assertValidId(category.id, messageHeader);
    this.assertNonEmptyString(category.name, `${messageHeader}: name`);

    assert(
      category.modifiedAt instanceof Date,
      `${messageHeader}: modifiedAt: not a Date`,
    );
    assert(
      category.createdAt instanceof Date,
      `${messageHeader}: createdAt: not a Date`,
    );
    assert(
      category.createdAt <= category.modifiedAt,
      `${messageHeader}: createdAt is later than modifiedAt`,
    );
  }

  /**
   * @param {Item} item
   * @param {string} messageHeader
   */
  assertValidItem(item, messageHeader) {
    this.assertValidId(item.id, messageHeader);
    this.assertNonEmptyString(item.name, `${messageHeader}: name`);
    assert(
      !item.categoryIds.some(
        (categoryId) =>
          categoryId < 0 || this.getCategory(categoryId) === undefined,
      ),
    );

    assert(
      item.modifiedAt instanceof Date,
      `${messageHeader}: modifiedAt: not a Date`,
    );
    assert(
      item.createdAt instanceof Date,
      `${messageHeader}: createdAt: not a Date`,
    );
    assert(
      item.createdAt <= item.modifiedAt,
      `${messageHeader}: createdAt is later than modifiedAt`,
    );
  }

  /**
   * @param {List} list
   * @param {string} messageHeader
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

    assert(
      list.modifiedAt instanceof Date,
      `${messageHeader}: modifiedAt: not a Date`,
    );
    assert(
      list.createdAt instanceof Date,
      `${messageHeader}: createdAt: not a Date`,
    );
    assert(
      list.createdAt <= list.modifiedAt,
      `${messageHeader}: createdAt is later than modifiedAt`,
    );
  }

  /**
   * @param {ListRef} listRef
   * @param {string} messageHeader
   */
  assertValidListRef(listRef, messageHeader) {
    this.assertValidId(listRef.listId, messageHeader);
    this.assertValidCount(listRef.count, messageHeader);
    assert(this.getLists().some((e) => e.id === listRef.listId));

    assert(
      listRef.modifiedAt instanceof Date,
      `${messageHeader}: modifiedAt: not a Date`,
    );
    assert(
      listRef.createdAt instanceof Date,
      `${messageHeader}: createdAt: not a Date`,
    );
    assert(
      listRef.createdAt <= listRef.modifiedAt,
      `${messageHeader}: createdAt is later than modifiedAt`,
    );
  }

  /**
   * @param {ItemRef} itemRef
   * @param {string} messageHeader
   */
  assertValidItemRef(itemRef, messageHeader) {
    this.assertValidId(itemRef.itemId, messageHeader);
    this.assertValidCount(itemRef.count, messageHeader);
    assert(
      this.getItems().some((e) => e.id === itemRef.itemId),
      `${messageHeader}: references invalid item id`,
    );

    assert(
      itemRef.modifiedAt instanceof Date,
      `${messageHeader}: modifiedAt: not a Date`,
    );
    assert(
      itemRef.createdAt instanceof Date,
      `${messageHeader}: createdAt: not a Date`,
    );
    assert(
      itemRef.createdAt <= itemRef.modifiedAt,
      `${messageHeader}: createdAt is later than modifiedAt`,
    );
  }

  /**
   * @param {number} id
   * @param {string} [messageHeader]
   */
  assertValidId(id, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(typeof id === "number", `${base}id not a number`);
    assert(id >= 0, `${base}id was < 0`);
  }

  /**
   * @param {number} count
   * @param {string} [messageHeader]
   */
  assertValidCount(count, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(typeof count === "number", `${base}count not a number`);
    assert(count >= 1, `${base}count was < 1`);
  }

  /**
   * @param {string} s
   * @param {string} [messageHeader]
   */
  assertNonEmptyString(s, messageHeader) {
    const base = messageHeader ? `${messageHeader}: ` : "";
    assert(typeof s === "string", `${base}not a string`);
    assert(s !== "", `${base}was empty`);
  }
}
