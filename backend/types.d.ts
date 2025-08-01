export type Category = {
  id: number;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
};

export type CategoryPatch = Partial<Category>;

export type Item = {
  id: number;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  categoryIds: number[];
};

export type ItemPatch = Partial<Item>;

export type ItemRef = {
  itemId: number;
  count: number;
  createdAt: Date;
  modifiedAt: Date;
};

export type List = {
  id: number;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  itemRefs: ItemRef[];
  listRefs: ListRef[];
};

export type ListPatch = Partial<List>;

export type ListRef = {
  listId: number;
  count: number;
  createdAt: Date;
  modifiedAt: Date;
};
