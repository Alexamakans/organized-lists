// @ts-check

import fs from "fs";
import os from "os";
import path from "path";
import { DB } from "../db.mjs";

/**
 * @returns string
 */
function createTempFile() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "db-test"));
  return path.join(tempDir, "db.json");
}

describe("DB", () => {
  let file;
  /** @type {InstanceType<typeof DB>} */
  let db;

  beforeEach(() => {
    file = createTempFile();
    db = new DB(file);
  });

  test("creates a new category", () => {
    const category = db.postCategory("Books");
    expect(category.name).toBe("Books");
    expect(category.id).toBe(0);
    expect(category.createdAt).toBeInstanceOf(Date);
    expect(category.modifiedAt).toBeInstanceOf(Date);
  });

  test("patches an existing category", () => {
    const category = db.postCategory("Old");
    const updated = db.patchCategory(category.id, { name: "New" });
    expect(updated?.name).toBe("New");
  });

  test("returns null when patching non-existent category", () => {
    const result = db.patchCategory(999, { name: "Hello" });
    expect(result).toBeNull();
  });

  test("deletes a category", () => {
    const category = db.postCategory("Temp");
    const result = db.deleteCategory(category.id);
    expect(result).toBe(true);
    expect(db.getCategories()).toHaveLength(0);
  });

  test("persists data to disk", () => {
    db.postCategory("I Persist");
    const db2 = new DB(file);
    const categories = db2.getCategories();
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe("I Persist");
  });

  test("creates and retrieves item with category", () => {
    const cat = db.postCategory("Produce");
    const item = db.postItem("Apple", [cat.id]);
    expect(item.name).toBe("Apple");
    expect(item.categoryIds).toEqual([cat.id]);

    const fetched = db.getItem(item.id);
    expect(fetched?.name).toBe("Apple");
  });

  test("fails to post item with invalid category", () => {
    expect(() => {
      db.postItem({ name: "Fork", categoryIds: [1234] });
    }).toThrow();
  });

  test("returns false when deleting non-existent category", () => {
    expect(db.deleteCategory(42)).toBe(false);
  });

  afterEach(() => {
    if (file) {
      fs.rmSync(path.dirname(file), { recursive: true, force: true });
    }
  });
});
