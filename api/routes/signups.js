const express = require("express");
const { v4: uuid } = require("uuid");
const { dynamo, TABLE_NAME } = require("../dynamo");

const router = express.Router();

// ─── Helpers ────────────────────────────────────────────────────────────────

// Skip the artificial delay in test environments so the test suite runs fast
const DELAY_MS = process.env.NODE_ENV === "test" ? 0 : 5000;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Basic server-side validation.
 * Returns an array of error messages; empty array means the payload is valid.
 */
function validatePayload(body) {
  const errors = [];
  if (!body.name  || !body.name.trim())          errors.push("name is required");
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
                                                  errors.push("valid email is required");
  if (!body.phone || !/^\d{10}$/.test(body.phone.replace(/\D/g, "")))
                                                  errors.push("10-digit phone is required");
  if (!body.category || !body.category.trim())    errors.push("category is required");
  return errors;
}

// ─── GET /signups ────────────────────────────────────────────────────────────
// Optional query param: ?category=nfl
// When category is present, queries the GSI instead of scanning the whole table.

router.get("/", async (req, res) => {
  const { category } = req.query;

  try {
    let items;

    if (category && category !== "ALL") {
      // GSI query — efficient: only reads items in the requested category
      const result = await dynamo
        .query({
          TableName: TABLE_NAME,
          IndexName: "category-index",
          KeyConditionExpression: "category = :cat",
          ExpressionAttributeValues: { ":cat": category },
        })
        .promise();
      items = result.Items;
    } else {
      // Full table scan — used when no filter is selected
      const result = await dynamo
        .scan({ TableName: TABLE_NAME })
        .promise();
      items = result.Items;
    }

    // Sort newest-first by createdAt timestamp
    items.sort((a, b) => b.createdAt - a.createdAt);

    res.json(items);
  } catch (err) {
    console.error("GET /signups error:", err);
    res.status(500).json({ error: "Failed to fetch signups" });
  }
});

// ─── POST /signups ───────────────────────────────────────────────────────────
// Intentional 5-second delay to demonstrate the SAVING UI state.

router.post("/", async (req, res) => {
  const errors = validatePayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // 5-second artificial delay — lets the UI show its "Saving…" spinner
  // (DELAY_MS is 0 in test environments so the test suite stays fast)
  await delay(DELAY_MS);

  try {
    const item = {
      id:        uuid(),
      name:      req.body.name.trim(),
      email:     req.body.email.trim().toLowerCase(),
      phone:     req.body.phone.replace(/\D/g, ""), // store digits only
      category:  req.body.category.trim(),
      createdAt: Date.now(),
    };

    await dynamo
      .put({ TableName: TABLE_NAME, Item: item })
      .promise();

    res.status(201).json(item);
  } catch (err) {
    console.error("POST /signups error:", err);
    res.status(500).json({ error: "Failed to save signup" });
  }
});

// ─── DELETE /signups/:id ─────────────────────────────────────────────────────
// Bonus: handy during development to clear test data

router.delete("/:id", async (req, res) => {
  try {
    await dynamo
      .delete({ TableName: TABLE_NAME, Key: { id: req.params.id } })
      .promise();
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /signups/:id error:", err);
    res.status(500).json({ error: "Failed to delete signup" });
  }
});

module.exports = router;
