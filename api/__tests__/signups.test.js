const request = require("supertest");
const app     = require("../app");

// ─── Stub the DynamoDB module ─────────────────────────────────────────────────
// jest.mock replaces ../dynamo with an auto-mock so no real DB is ever contacted.
jest.mock("../dynamo", () => ({
  TABLE_NAME: "Signups",
  dynamo: {
    scan:   jest.fn(),
    query:  jest.fn(),
    put:    jest.fn(),
    delete: jest.fn(),
  },
}));

// Import the mocked dynamo AFTER jest.mock() so we get the stub version
const { dynamo } = require("../dynamo");

const SAMPLE_ITEM = {
  id:        "abc-123",
  name:      "Alice Smith",
  email:     "alice@example.com",
  phone:     "5551234567",
  category:  "nfl",
  createdAt: 1700000000000,
};

const VALID_PAYLOAD = {
  name:     "Alice Smith",
  email:    "alice@example.com",
  phone:    "555-123-4567",   // hyphens should be stripped server-side
  category: "nfl",
};

// ─── Reset mocks between tests ────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /signups
// ═══════════════════════════════════════════════════════════════════════════════

describe("GET /signups", () => {
  it("returns 200 and an array of all signups (no filter)", async () => {
    dynamo.scan.mockReturnValue({
      promise: () => Promise.resolve({ Items: [SAMPLE_ITEM] }),
    });

    const res = await request(app).get("/signups");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe("Alice Smith");
    expect(dynamo.scan).toHaveBeenCalledTimes(1);
    expect(dynamo.query).not.toHaveBeenCalled();
  });

  it("uses the GSI query when a category param is provided", async () => {
    dynamo.query.mockReturnValue({
      promise: () => Promise.resolve({ Items: [SAMPLE_ITEM] }),
    });

    const res = await request(app).get("/signups?category=nfl");

    expect(res.status).toBe(200);
    expect(dynamo.query).toHaveBeenCalledTimes(1);
    expect(dynamo.query).toHaveBeenCalledWith(
      expect.objectContaining({
        IndexName: "category-index",
        ExpressionAttributeValues: { ":cat": "nfl" },
      })
    );
    expect(dynamo.scan).not.toHaveBeenCalled();
  });

  it("falls back to a full scan when category=ALL", async () => {
    dynamo.scan.mockReturnValue({
      promise: () => Promise.resolve({ Items: [] }),
    });

    const res = await request(app).get("/signups?category=ALL");

    expect(res.status).toBe(200);
    expect(dynamo.scan).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when DynamoDB throws", async () => {
    dynamo.scan.mockReturnValue({
      promise: () => Promise.reject(new Error("DynamoDB unavailable")),
    });

    const res = await request(app).get("/signups");

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /signups
// ═══════════════════════════════════════════════════════════════════════════════

describe("POST /signups", () => {
  it("returns 201 and the saved item for a valid payload", async () => {
    dynamo.put.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const res = await request(app).post("/signups").send(VALID_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Alice Smith");
    expect(res.body.email).toBe("alice@example.com");
    expect(res.body.phone).toBe("5551234567"); // hyphens stripped
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
    expect(dynamo.put).toHaveBeenCalledTimes(1);
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/signups")
      .send({ email: "a@b.com", phone: "5551234567", category: "nfl" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("name is required");
    expect(dynamo.put).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid email", async () => {
    const res = await request(app)
      .post("/signups")
      .send({ name: "Bob", email: "not-an-email", phone: "5551234567", category: "nfl" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("valid email is required");
  });

  it("returns 400 for a phone number with fewer than 10 digits", async () => {
    const res = await request(app)
      .post("/signups")
      .send({ name: "Bob", email: "bob@example.com", phone: "123", category: "nfl" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("10-digit phone is required");
  });

  it("returns 400 when category is missing", async () => {
    const res = await request(app)
      .post("/signups")
      .send({ name: "Bob", email: "bob@example.com", phone: "5551234567" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("category is required");
  });

  it("returns 400 with multiple errors when several fields are invalid", async () => {
    const res = await request(app).post("/signups").send({});

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(1);
  });

  it("returns 500 when DynamoDB put fails", async () => {
    dynamo.put.mockReturnValue({
      promise: () => Promise.reject(new Error("Write failed")),
    });

    const [res] = await Promise.all([
      request(app).post("/signups").send(VALID_PAYLOAD),
    ]);

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /signups/:id
// ═══════════════════════════════════════════════════════════════════════════════

describe("DELETE /signups/:id", () => {
  it("returns 204 on successful delete", async () => {
    dynamo.delete.mockReturnValue({
      promise: () => Promise.resolve({}),
    });

    const res = await request(app).delete("/signups/abc-123");

    expect(res.status).toBe(204);
    expect(dynamo.delete).toHaveBeenCalledWith(
      expect.objectContaining({ Key: { id: "abc-123" } })
    );
  });

  it("returns 500 when DynamoDB delete fails", async () => {
    dynamo.delete.mockReturnValue({
      promise: () => Promise.reject(new Error("Delete failed")),
    });

    const res = await request(app).delete("/signups/abc-123");

    expect(res.status).toBe(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /health
// ═══════════════════════════════════════════════════════════════════════════════

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 404 fallback
// ═══════════════════════════════════════════════════════════════════════════════

describe("Unknown routes", () => {
  it("returns 404 for unrecognized paths", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
  });
});
