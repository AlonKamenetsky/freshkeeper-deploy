// routes/recipes.js

const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipesController");
const { authorize } = require("../middleware/auth");

// POST /recipes/suggest - all roles can request recipe suggestions (must be before /:id)
router.post("/suggest", authorize("admin", "employee", "consumer"), recipesController.suggestRecipes);

// POST /recipes/predict-expiration - all roles can predict expiration
router.post("/predict-expiration", authorize("admin", "employee", "consumer"), recipesController.predictExpiration);

// GET /recipes - all roles can view recipes
router.get("/", authorize("admin", "employee", "consumer"), recipesController.getAllRecipes);

// GET /recipes/:id - all roles can view a recipe
router.get("/:id", authorize("admin", "employee", "consumer"), recipesController.getRecipeById);

// POST /recipes - admin only can add recipes
router.post("/", authorize("admin"), recipesController.createRecipe);

// PUT /recipes/:id - admin and employee can update recipes
router.put("/:id", authorize("admin", "employee"), recipesController.updateRecipe);

// DELETE /recipes/:id - admin only can delete recipes
router.delete("/:id", authorize("admin"), recipesController.deleteRecipe);

module.exports = router;
