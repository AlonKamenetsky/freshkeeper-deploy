// models/users.js - Mock user data for FreshKeeper

let users = [
  {
    userId: 1,
    firstName: "Alice",
    lastName: "Admin",
    email: "admin@fresh.com",
    password: "admin123",
    createDate: "2024-01-10T08:00:00.000Z",
    updateDate: "2024-01-10T08:00:00.000Z",
    userRole: "admin"
  },
  {
    userId: 2,
    firstName: "Bob",
    lastName: "Employee",
    email: "employee@fresh.com",
    password: "emp123",
    createDate: "2024-02-15T09:30:00.000Z",
    updateDate: "2024-02-15T09:30:00.000Z",
    userRole: "employee"
  },
  {
    userId: 3,
    firstName: "Carol",
    lastName: "Consumer",
    email: "consumer@fresh.com",
    password: "cons123",
    createDate: "2024-03-01T11:00:00.000Z",
    updateDate: "2024-03-01T11:00:00.000Z",
    userRole: "consumer"
  }
];

let nextUserId = 5;

function getAll() {
  return users;
}

function getById(id) {
  return users.find(u => u.userId === id) || null;
}

function create({ firstName, lastName, userRole }) {
  const now = new Date().toISOString();
  const newUser = {
    userId: nextUserId++,
    firstName,
    lastName,
    createDate: now,
    updateDate: now,
    userRole: userRole || "consumer"
  };
  users.push(newUser);
  return newUser;
}

function update(id, { firstName, lastName, userRole }) {
  const user = users.find(u => u.userId === id);
  if (!user) return null;
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (userRole !== undefined) user.userRole = userRole;
  user.updateDate = new Date().toISOString();
  return user;
}

function remove(id) {
  const index = users.findIndex(u => u.userId === id);
  if (index === -1) return null;
  const removed = users[index];
  users.splice(index, 1);
  return removed;
}

function findByEmailAndPassword(email, password) {
  return users.find(u => u.email === email && u.password === password) || null;
}

module.exports = { getAll, getById, create, update, remove, findByEmailAndPassword };