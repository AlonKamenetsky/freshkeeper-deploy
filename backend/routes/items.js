// routes/items.js

const express = require("express");
const router = express.Router();
const itemsController = require("../controllers/itemsController");
const { authorize } = require("../middleware/auth");

// GET /items - all roles can view inventory
router.get("/", authorize("admin", "employee", "consumer"), itemsController.getAllItems);

// GET /items/:id - all roles can view a single item
router.get("/:id", authorize("admin", "employee", "consumer"), itemsController.getItemById);

// POST /items - admin, employee AND consumer can add items
router.post('/', authorize('admin', 'employee', 'consumer'), itemsController.createItem);
// PUT /items/:id - admin and employee can update items; consumer can also update (e.g. reduce quantity)
router.put("/:id", authorize("admin", "employee", "consumer"), itemsController.updateItem);

// DELETE /items/:id - admin only can delete items
router.delete("/:id", authorize("admin", "employee", "consumer"), itemsController.deleteItem);
module.exports = router;
