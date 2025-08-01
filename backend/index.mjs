// @ts-check

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { DB } from "./db.mjs";
import { addEndpoints as addCategoryEndpoints } from "./api/v1/category.mjs";
import { addEndpoints as addItemEndpoints } from "./api/v1/item.mjs";
import { addEndpoints as addListEndpoints } from "./api/v1/list.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 60001;

app.use(cors());
app.use(express.json());

const db = new DB(join(__dirname, "db.json"));

addCategoryEndpoints(app, db);
addItemEndpoints(app, db);
addListEndpoints(app, db);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
