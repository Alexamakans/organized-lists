export type Category = {
  id: number;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
};

export type CategoryPartial = Partial<Category>;

export type Item = {
  id: number;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  categoryIds: number[];
};

export type ItemPartial = Partial<Item>;

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

export type ListPartial = Partial<List>;

export type ListRef = {
  listId: number;
  count: number;
  createdAt: Date;
  modifiedAt: Date;
};
