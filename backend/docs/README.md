# FreshKeeper - Backend API

A REST API backend for FreshKeeper — a food inventory and recipe management web application.

---

## Setup & Running

### Install dependencies
```bash
npm install
```

### Start the server
```bash
npm start
# or
node server.js
```

### Dev mode (auto-restart with nodemon)
```bash
npm run dev
```

- **Port:** `3000`
- **Base URL:** `http://localhost:3000`

---

## Authentication & Roles

This API uses **simulated role-based access control**. There is no login system.

Include the `x-user-role` header in every request:

| Header | Value |
|--------|-------|
| `x-user-role` | `admin` |
| `x-user-role` | `employee` |
| `x-user-role` | `consumer` |

### Role permissions

| Action | admin | employee | consumer |
|--------|-------|----------|----------|
| View users | ✅ | ✅ | ❌ |
| Create/update users | ✅ | ✅ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Add items (inventory) | ✅ | ✅ | ❌ |
| Update items | ✅ | ✅ | ✅ |
| Delete items | ✅ | ❌ | ❌ |
| View items & recipes | ✅ | ✅ | ✅ |
| Add/update recipes | ✅ | ✅ | ❌ |
| Delete recipes | ✅ | ❌ | ❌ |
| Suggest recipes | ✅ | ✅ | ✅ |
| Predict expiration | ✅ | ✅ | ✅ |

---

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET / PUT / DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## API Reference

### Users

| Method | Path | Role Required | Description |
|--------|------|--------------|-------------|
| GET | `/users` | admin, employee | List all users |
| GET | `/users/:id` | admin, employee | Get one user |
| POST | `/users` | admin | Create user |
| PUT | `/users/:id` | admin, employee | Update user |
| DELETE | `/users/:id` | admin | Delete user |

#### User fields
```json
{
  "userId": 1,
  "firstName": "Alice",
  "lastName": "Admin",
  "createDate": "2024-01-10T08:00:00.000Z",
  "updateDate": "2024-01-10T08:00:00.000Z",
  "userRole": "admin"
}
```

#### POST /users — request body
```json
{
  "firstName": "Dan",
  "lastName": "Cohen",
  "userRole": "consumer"
}
```
Valid userRole values: `admin`, `employee`, `consumer`

#### POST /users — success response (201)
```json
{
  "success": true,
  "data": { "userId": 5 },
  "error": null
}
```

#### GET /users — success response
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "firstName": "Alice",
      "lastName": "Admin",
      "createDate": "2024-01-10T08:00:00.000Z",
      "updateDate": "2024-01-10T08:00:00.000Z",
      "userRole": "admin"
    }
  ],
  "error": null
}
```

---

### Items (Pantry Inventory)

| Method | Path | Role Required | Description |
|--------|------|--------------|-------------|
| GET | `/items` | all | List all items (supports filters) |
| GET | `/items/:id` | all | Get one item |
| POST | `/items` | admin, employee | Add item to pantry |
| PUT | `/items/:id` | all | Update item |
| DELETE | `/items/:id` | admin | Delete item |

#### Query Parameters for GET /items

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `storageType` | string | `fridge` | Filter by storage location |
| `category` | string | `vegetables` | Filter by food category |
| `userId` | number | `3` | Filter by owner |
| `expiringSoon` | boolean | `true` | Only items expiring within 3 days |

Example: `GET /items?storageType=fridge&expiringSoon=true`

#### Item fields
```json
{
  "itemId": 1,
  "name": "Milk",
  "quantity": 2,
  "unit": "liters",
  "expirationDate": "2025-05-05",
  "storageType": "fridge",
  "category": "dairy",
  "userId": 3,
  "createDate": "2025-04-28T10:00:00.000Z",
  "updateDate": "2025-04-28T10:00:00.000Z"
}
```

Valid `storageType` values: `fridge`, `freezer`, `pantry`  
Valid `category` values: `dairy`, `meat`, `vegetables`, `fruits`, `grains`, `other`

#### POST /items — request body
```json
{
  "name": "Tomatoes",
  "quantity": 6,
  "unit": "units",
  "expirationDate": "2025-05-10",
  "storageType": "pantry",
  "category": "vegetables",
  "userId": 3
}
```
Required: `name`, `quantity`

#### POST /items — success response (201)
```json
{
  "success": true,
  "data": { "itemId": 7 },
  "error": null
}
```

---

### Recipes

| Method | Path | Role Required | Description |
|--------|------|--------------|-------------|
| GET | `/recipes` | all | List all recipes |
| GET | `/recipes/:id` | all | Get one recipe |
| POST | `/recipes` | admin | Create recipe |
| PUT | `/recipes/:id` | admin, employee | Update recipe |
| DELETE | `/recipes/:id` | admin | Delete recipe |
| POST | `/recipes/suggest` | all | Get AI recipe suggestions |
| POST | `/recipes/predict-expiration` | all | Predict item shelf life |

#### Recipe fields
```json
{
  "recipeId": 1,
  "name": "Scrambled Eggs with Spinach",
  "ingredients": ["eggs", "spinach", "milk"],
  "instructions": "1. Beat eggs...",
  "prepTime": 5,
  "cookTime": 10,
  "servings": 2,
  "tags": ["vegetarian", "gluten-free"]
}
```

#### GET /recipes?tags=vegetarian,gluten-free

Filter recipes by comma-separated tags.

#### POST /recipes/suggest — request body
```json
{
  "ingredients": ["eggs", "spinach", "milk"],
  "preferences": ["vegetarian"]
}
```

#### POST /recipes/suggest — success response
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "recipeId": 1,
        "name": "Scrambled Eggs with Spinach",
        "matchScore": 75,
        "matchedIngredients": ["eggs", "spinach", "milk"],
        "missingIngredients": ["butter", "salt", "pepper"],
        "tags": ["vegetarian", "gluten-free"],
        "prepTime": 5,
        "cookTime": 10,
        "servings": 2
      }
    ],
    "total": 1
  },
  "error": null
}
```

#### POST /recipes/predict-expiration — request body
```json
{
  "category": "dairy",
  "storageType": "fridge"
}
```

#### POST /recipes/predict-expiration — success response
```json
{
  "success": true,
  "data": {
    "predictedExpirationDate": "2025-05-09",
    "estimatedDays": 7,
    "basis": "dairy stored in fridge"
  },
  "error": null
}
```

---

## Assumptions

1. IDs are numeric, auto-incremented integers starting from 1.
2. All data is stored in-memory and resets on server restart.
3. Authentication is simulated via `x-user-role` header — no real login required.
4. `createDate` and `updateDate` are set automatically by the server.
5. Recipe suggestion requires at least 50% ingredient match to be returned.
6. Items expiring within 3 days are considered "expiring soon".

---

## Project Structure

```
freshkeeper/
├── server.js              # Express app setup, middleware, port
├── package.json
├── routes/
│   ├── users.js           # User route definitions
│   ├── items.js           # Item route definitions
│   └── recipes.js         # Recipe route definitions
├── controllers/
│   ├── usersController.js
│   ├── itemsController.js
│   └── recipesController.js
├── models/
│   ├── users.js           # Mock user data + CRUD functions
│   ├── items.js           # Mock item data + CRUD functions
│   └── recipes.js         # Mock recipe data + suggest + predict
├── middleware/
│   ├── logger.js          # Request/response logger
│   ├── auth.js            # Role-based access control
│   └── response.js        # Standardized response helpers
└── docs/
    ├── README.md
    └── FreshKeeper.postman_collection.json
```
