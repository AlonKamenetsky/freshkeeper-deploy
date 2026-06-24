// models/items.js - Mock pantry items data for FreshKeeper

let items = [
  {
    itemId: 1,
    name: "Milk",
    quantity: 2,
    unit: "liters",
    expirationDate: "2025-05-05",
    storageType: "fridge",
    category: "dairy",
    userId: 3,
    createDate: "2025-04-28T10:00:00.000Z",
    updateDate: "2025-04-28T10:00:00.000Z"
  },
  {
    itemId: 2,
    name: "Eggs",
    quantity: 12,
    unit: "units",
    expirationDate: "2025-05-15",
    storageType: "fridge",
    category: "dairy",
    userId: 3,
    createDate: "2025-04-28T10:05:00.000Z",
    updateDate: "2025-04-28T10:05:00.000Z"
  },
  {
    itemId: 3,
    name: "Chicken Breast",
    quantity: 500,
    unit: "grams",
    expirationDate: "2025-05-03",
    storageType: "freezer",
    category: "meat",
    userId: 3,
    createDate: "2025-04-29T08:00:00.000Z",
    updateDate: "2025-04-29T08:00:00.000Z"
  },
  {
    itemId: 4,
    name: "Tomatoes",
    quantity: 6,
    unit: "units",
    expirationDate: "2025-05-04",
    storageType: "pantry",
    category: "vegetables",
    userId: 4,
    createDate: "2025-04-30T09:00:00.000Z",
    updateDate: "2025-04-30T09:00:00.000Z"
  },
  {
    itemId: 5,
    name: "Pasta",
    quantity: 400,
    unit: "grams",
    expirationDate: "2026-01-01",
    storageType: "pantry",
    category: "grains",
    userId: 4,
    createDate: "2025-04-30T09:10:00.000Z",
    updateDate: "2025-04-30T09:10:00.000Z"
  },
  {
    itemId: 6,
    name: "Spinach",
    quantity: 200,
    unit: "grams",
    expirationDate: "2025-05-03",
    storageType: "fridge",
    category: "vegetables",
    userId: 3,
    createDate: "2025-05-01T07:00:00.000Z",
    updateDate: "2025-05-01T07:00:00.000Z"
  }
];

let nextItemId = 7;

function getAll(filters = {}) {
  let result = [...items];
  if (filters.storageType) {
    result = result.filter(i => i.storageType === filters.storageType);
  }
  if (filters.category) {
    result = result.filter(i => i.category === filters.category);
  }
  if (filters.userId) {
    result = result.filter(i => i.userId === Number(filters.userId));
  }
  if (filters.expiringSoon) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 3);
    result = result.filter(i => new Date(i.expirationDate) <= cutoff);
  }
  return result;
}

function getById(id) {
  return items.find(i => i.itemId === id) || null;
}

function create({ name, quantity, unit, expirationDate, storageType, category, userId }) {
  const now = new Date().toISOString();
  const newItem = {
    itemId: nextItemId++,
    name,
    quantity,
    unit: unit || "units",
    expirationDate: expirationDate || null,
    storageType: storageType || "pantry",
    category: category || "other",
    userId: userId || null,
    createDate: now,
    updateDate: now
  };
  items.push(newItem);
  return newItem;
}

function update(id, fields) {
  const item = items.find(i => i.itemId === id);
  if (!item) return null;
  const allowed = ["name", "quantity", "unit", "expirationDate", "storageType", "category"];
  allowed.forEach(key => {
    if (fields[key] !== undefined) item[key] = fields[key];
  });
  item.updateDate = new Date().toISOString();
  return item;
}

function remove(id) {
  const index = items.findIndex(i => i.itemId === id);
  if (index === -1) return null;
  const removed = items[index];
  items.splice(index, 1);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };
