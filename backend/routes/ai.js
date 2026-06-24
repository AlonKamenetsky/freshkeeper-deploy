// routes/ai.js
const express  = require('express');
const router   = express.Router();
const aiCtrl   = require('../controllers/aiController');
const { authorize } = require('../middleware/auth');

// All AI endpoints require a valid role
router.post('/suggest-recipe', authorize('admin', 'employee', 'consumer'), aiCtrl.suggestRecipe);
router.post('/food-tips',      authorize('admin', 'employee', 'consumer'), aiCtrl.foodTips);

module.exports = router;
