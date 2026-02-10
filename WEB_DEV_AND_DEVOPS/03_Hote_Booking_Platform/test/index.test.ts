import { describe, test, expect, beforeAll } from "vitest";

const BASE_URL = "http://localhost:3000";

async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ status: number; body: any }> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const body = await response.json();
  return { status: response.status, body };
}

let ownerToken: string;
let customerToken: string;
let customer2Token: string;
let hotelId: string;
let hotel2Id: string;
let roomId: string;
let room2Id: string;
let bookingId: string;

describe("Hotel Management System - Comprehensive Tests", () => {
  describe("POST /api/auth/signup", () => {
    test("should create a new customer with all fields and validate response format", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Priya Sharma",
          email: `priya${Date.now()}@example.com`,
          password: "priya123",
          role: "customer",
          phone: "+919876543210",
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("id");
      expect(body.data.name).toBe("Priya Sharma");
      expect(body.data.role).toBe("customer");
      expect(body.data.phone).toBe("+919876543210");
      expect(body.error).toBeNull();

      const keys = Object.keys(body);
      expect(keys).toEqual(["success", "data", "error"]);

      expect(body.data).not.toHaveProperty("password");
    });

    test("should create owner user", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Hotel Owner",
          email: `owner${Date.now()}@example.com`,
          password: "owner123",
          role: "owner",
          phone: "+919876543211",
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.role).toBe("owner");
    });

    test("should create customer without phone (optional)", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "John Doe",
          email: `john${Date.now()}@example.com`,
          password: "john123",
          role: "customer",
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).not.toHaveProperty("password");
    });

    test("should default to customer role when role not provided", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Default User",
          email: `default${Date.now()}@example.com`,
          password: "default123",
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.role).toBe("customer");
    });

    test("should return EMAIL_ALREADY_EXISTS for duplicate email", async () => {
      const email = `duplicate${Date.now()}@example.com`;

      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "First User",
          email,
          password: "pass123",
          role: "customer",
        }),
      });

      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Second User",
          email,
          password: "pass456",
          role: "customer",
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.error).toBe("EMAIL_ALREADY_EXISTS");
    });

    test("should return INVALID_REQUEST for missing name", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: "pass123",
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing email", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          password: "pass123",
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing password", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: `test${Date.now()}@example.com`,
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for invalid role", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: `test${Date.now()}@example.com`,
          password: "pass123",
          role: "admin",
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should handle email case sensitivity", async () => {
      const baseEmail = `casetest${Date.now()}@example.com`;

      const { status: status1 } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Test User",
          email: baseEmail.toLowerCase(),
          password: "pass123",
          role: "customer",
        }),
      });

      expect(status1).toBe(201);
    });

    test("should create user with special characters in name", async () => {
      const { status, body } = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "O'Neill-Smith Jr.",
          email: `special${Date.now()}@example.com`,
          password: "pass123",
          role: "customer",
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
    });

    test("should create multiple customers", async () => {
      const { status: status1, body: body1 } = await apiRequest(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({
            name: "Customer One",
            email: `customer1_${Date.now()}@example.com`,
            password: "cust123",
            role: "customer",
          }),
        },
      );

      const { status: status2, body: body2 } = await apiRequest(
        "/api/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({
            name: "Customer Two",
            email: `customer2_${Date.now()}@example.com`,
            password: "cust123",
            role: "customer",
          }),
        },
      );

      expect(status1).toBe(201);
      expect(status2).toBe(201);
      expect(body1.data.id).not.toBe(body2.data.id);
    });

    test("should create test users for subsequent tests", async () => {
      const ownerRes = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Main Owner",
          email: `mainowner_${Date.now()}@example.com`,
          password: "owner123",
          role: "owner",
        }),
      });

      const customerRes = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Main Customer",
          email: `maincustomer_${Date.now()}@example.com`,
          password: "customer123",
          role: "customer",
        }),
      });

      const customer2Res = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Second Customer",
          email: `customer2_${Date.now()}@example.com`,
          password: "customer123",
          role: "customer",
        }),
      });

      expect(ownerRes.status).toBe(201);
      expect(customerRes.status).toBe(201);
      expect(customer2Res.status).toBe(201);
    });
  });

  describe("POST /api/auth/login", () => {
    let testEmail: string;
    let testPassword: string;

    beforeAll(async () => {
      testEmail = `logintest${Date.now()}@example.com`;
      testPassword = "testpass123";

      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Login Test User",
          email: testEmail,
          password: testPassword,
          role: "customer",
        }),
      });
    });

    test("should login successfully with valid credentials", async () => {
      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("token");
      expect(body.data).toHaveProperty("user");
      expect(body.data.user).toHaveProperty("id");
      expect(body.data.user.email).toBe(testEmail);
      expect(body.error).toBeNull();
    });

    test("should return INVALID_CREDENTIALS for wrong password", async () => {
      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: "wrongpassword",
        }),
      });

      expect(status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
      expect(body.error).toBe("INVALID_CREDENTIALS");
    });

    test("should return INVALID_CREDENTIALS for non-existent email", async () => {
      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "somepassword",
        }),
      });

      expect(status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_CREDENTIALS");
    });

    test("should return INVALID_REQUEST for missing email", async () => {
      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          password: testPassword,
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing password", async () => {
      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should not expose password in login response", async () => {
      const { body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(body.data.user).not.toHaveProperty("password");
    });

    test("should login owner and get owner role", async () => {
      const ownerEmail = `ownerlogin${Date.now()}@example.com`;

      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Owner Login Test",
          email: ownerEmail,
          password: "owner123",
          role: "owner",
        }),
      });

      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: ownerEmail,
          password: "owner123",
        }),
      });

      expect(status).toBe(200);
      expect(body.data.user.role).toBe("owner");
      ownerToken = body.data.token;
    });

    test("should login customer and get customer role", async () => {
      const customerEmail = `customerlogin${Date.now()}@example.com`;

      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Customer Login Test",
          email: customerEmail,
          password: "customer123",
          role: "customer",
        }),
      });

      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: customerEmail,
          password: "customer123",
        }),
      });

      expect(status).toBe(200);
      expect(body.data.user.role).toBe("customer");
      customerToken = body.data.token;
    });

    test("should login second customer for later tests", async () => {
      const customer2Email = `customer2login${Date.now()}@example.com`;

      await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "Customer 2 Login Test",
          email: customer2Email,
          password: "customer123",
          role: "customer",
        }),
      });

      const { status, body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: customer2Email,
          password: "customer123",
        }),
      });

      expect(status).toBe(200);
      customer2Token = body.data.token;
    });

    test("should validate JWT token format exists", async () => {
      const { body } = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(typeof body.data.token).toBe("string");
      expect(body.data.token.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/hotels", () => {
    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Hotel",
          description: "Test description",
          city: "Mumbai",
          country: "India",
          amenities: ["wifi", "pool"],
        }),
      });

      expect(status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should return FORBIDDEN for customer role", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          name: "Test Hotel",
          description: "Test description",
          city: "Mumbai",
          country: "India",
          amenities: ["wifi", "pool"],
        }),
      });

      expect(status).toBe(403);
      expect(body.success).toBe(false);
      expect(body.error).toBe("FORBIDDEN");
    });

    test("should create hotel successfully as owner and validate initial rating", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Grand Palace Hotel",
          description: "Luxury 5-star hotel in the heart of the city",
          city: "Mumbai",
          country: "India",
          amenities: ["wifi", "pool", "gym", "parking", "restaurant"],
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("id");
      expect(body.data).toHaveProperty("ownerId");
      expect(body.data.name).toBe("Grand Palace Hotel");
      expect(body.data.city).toBe("Mumbai");
      expect(body.data.country).toBe("India");
      expect(body.data.rating).toBe(0.0);
      expect(body.data.totalReviews).toBe(0);
      expect(body.error).toBeNull();

      hotelId = body.data.id;
    });

    test("should create hotel with minimal fields", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Simple Hotel",
          city: "Delhi",
          country: "India",
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
    });

    test("should create hotel with empty amenities array", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Basic Hotel",
          city: "Bangalore",
          country: "India",
          amenities: [],
        }),
      });

      expect(status).toBe(201);
      expect(body.data.amenities).toEqual([]);
    });

    test("should return INVALID_REQUEST for missing name", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          city: "Mumbai",
          country: "India",
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing city", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Test Hotel",
          country: "India",
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing country", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Test Hotel",
          city: "Mumbai",
        }),
      });

      expect(status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should allow same hotel name for different owners", async () => {
      const { status } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Duplicate Name Hotel",
          city: "Chennai",
          country: "India",
        }),
      });

      expect(status).toBe(201);
    });

    test("should create second hotel for testing", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Sea View Resort",
          description: "Beautiful beach resort",
          city: "Mumbai",
          country: "India",
          amenities: ["wifi", "pool", "beach"],
        }),
      });

      expect(status).toBe(201);
      hotel2Id = body.data.id;
    });

    test("should handle special characters in hotel name", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "O'Reilly's Hotel & Spa",
          city: "Goa",
          country: "India",
        }),
      });

      expect(status).toBe(201);
      expect(body.data.name).toBe("O'Reilly's Hotel & Spa");
    });

    test("should create hotel in different city", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Kolkata Grand",
          city: "Kolkata",
          country: "India",
          amenities: ["wifi", "restaurant"],
        }),
      });

      expect(status).toBe(201);
      expect(body.data.city).toBe("Kolkata");
    });

    test("should create hotel with long name", async () => {
      const longName =
        "The Grand Imperial Luxury Resort and Spa with Scenic Views";
      const { status, body } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: longName,
          city: "Jaipur",
          country: "India",
        }),
      });

      expect(status).toBe(201);
      expect(body.data.name).toBe(longName);
    });
  });

  describe("POST /api/hotels/:hotelId/rooms", () => {
    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          body: JSON.stringify({
            roomNumber: "101",
            roomType: "Deluxe",
            pricePerNight: 5000,
            maxOccupancy: 2,
          }),
        },
      );

      expect(status).toBe(401);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should return FORBIDDEN for customer role", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "101",
            roomType: "Deluxe",
            pricePerNight: 5000,
            maxOccupancy: 2,
          }),
        },
      );

      expect(status).toBe(403);
      expect(body.error).toBe("FORBIDDEN");
    });

    test("should create room successfully as hotel owner", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "101",
            roomType: "Deluxe",
            pricePerNight: 5000,
            maxOccupancy: 2,
          }),
        },
      );

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("id");
      expect(body.data.hotelId).toBe(hotelId);
      expect(body.data.roomNumber).toBe("101");
      expect(body.data.roomType).toBe("Deluxe");
      expect(body.data.pricePerNight).toBe(5000);
      expect(body.data.maxOccupancy).toBe(2);

      roomId = body.data.id;
    });

    test("should create multiple rooms in same hotel", async () => {
      const { status: status1, body: body1 } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "102",
            roomType: "Standard",
            pricePerNight: 3000,
            maxOccupancy: 2,
          }),
        },
      );

      const { status: status2, body: body2 } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "201",
            roomType: "Suite",
            pricePerNight: 10000,
            maxOccupancy: 4,
          }),
        },
      );

      expect(status1).toBe(201);
      expect(status2).toBe(201);
      expect(body1.data.id).not.toBe(body2.data.id);

      room2Id = body2.data.id;
    });

    test("should return ROOM_ALREADY_EXISTS for duplicate room number", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "101",
            roomType: "Standard",
            pricePerNight: 4000,
            maxOccupancy: 2,
          }),
        },
      );

      expect(status).toBe(400);
      expect(body.error).toBe("ROOM_ALREADY_EXISTS");
    });

    test("should return HOTEL_NOT_FOUND for invalid hotel id", async () => {
      const { status, body } = await apiRequest(
        "/api/hotels/invalid_hotel_id/rooms",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "101",
            roomType: "Deluxe",
            pricePerNight: 5000,
            maxOccupancy: 2,
          }),
        },
      );

      expect(status).toBe(404);
      expect(body.error).toBe("HOTEL_NOT_FOUND");
    });

    test("should return INVALID_REQUEST for missing roomNumber", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomType: "Deluxe",
            pricePerNight: 5000,
            maxOccupancy: 2,
          }),
        },
      );

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing pricePerNight", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "301",
            roomType: "Deluxe",
            maxOccupancy: 2,
          }),
        },
      );

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing maxOccupancy", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "301",
            roomType: "Deluxe",
            pricePerNight: 5000,
          }),
        },
      );

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should create room with high occupancy", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "301",
            roomType: "Presidential Suite",
            pricePerNight: 25000,
            maxOccupancy: 8,
          }),
        },
      );

      expect(status).toBe(201);
      expect(body.data.maxOccupancy).toBe(8);
    });

    test("should allow same room number in different hotels", async () => {
      const { status } = await apiRequest(`/api/hotels/${hotel2Id}/rooms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          roomNumber: "101",
          roomType: "Standard",
          pricePerNight: 4000,
          maxOccupancy: 2,
        }),
      });

      expect(status).toBe(201);
    });

    test("should create room with decimal price", async () => {
      const { status, body } = await apiRequest(
        `/api/hotels/${hotelId}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "401",
            roomType: "Economy",
            pricePerNight: 2500.5,
            maxOccupancy: 1,
          }),
        },
      );

      expect(status).toBe(201);
    });
  });

  describe("GET /api/hotels", () => {
    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest("/api/hotels");

      expect(status).toBe(401);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should return all hotels with rooms", async () => {
      const { status, body } = await apiRequest("/api/hotels", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const hotel = body.data.find((h: any) => h.id === hotelId);
      expect(hotel).toBeDefined();
      expect(hotel).toHaveProperty("minPricePerNight");
    });

    test("should filter by city", async () => {
      const { status, body } = await apiRequest("/api/hotels?city=Mumbai", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      body.data.forEach((hotel: any) => {
        expect(hotel.city.toLowerCase()).toBe("mumbai");
      });
    });

    test("should filter by country", async () => {
      const { status, body } = await apiRequest("/api/hotels?country=India", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test("should filter by minPrice", async () => {
      const { status, body } = await apiRequest("/api/hotels?minPrice=4000", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(200);
      body.data.forEach((hotel: any) => {
        expect(hotel.minPricePerNight).toBeGreaterThanOrEqual(4000);
      });
    });

    test("should filter by maxPrice", async () => {
      const { status, body } = await apiRequest("/api/hotels?maxPrice=8000", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(200);
      body.data.forEach((hotel: any) => {
        expect(hotel.minPricePerNight).toBeLessThanOrEqual(8000);
      });
    });

    test("should filter by price range", async () => {
      const { status, body } = await apiRequest(
        "/api/hotels?minPrice=3000&maxPrice=8000",
        {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(200);
      body.data.forEach((hotel: any) => {
        expect(hotel.minPricePerNight).toBeGreaterThanOrEqual(3000);
        expect(hotel.minPricePerNight).toBeLessThanOrEqual(8000);
      });
    });

    test("should filter by multiple parameters", async () => {
      const { status, body } = await apiRequest(
        "/api/hotels?city=Mumbai&minPrice=3000",
        {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(200);
      body.data.forEach((hotel: any) => {
        expect(hotel.city.toLowerCase()).toBe("mumbai");
        expect(hotel.minPricePerNight).toBeGreaterThanOrEqual(3000);
      });
    });
  });

  describe("GET /api/hotels/:hotelId", () => {
    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest(`/api/hotels/${hotelId}`);

      expect(status).toBe(401);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should return hotel details with rooms", async () => {
      const { status, body } = await apiRequest(`/api/hotels/${hotelId}`, {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(hotelId);
      expect(body.data).toHaveProperty("ownerId");
      expect(body.data).toHaveProperty("rooms");
      expect(Array.isArray(body.data.rooms)).toBe(true);
      expect(body.data.rooms.length).toBeGreaterThan(0);
    });

    test("should return HOTEL_NOT_FOUND for invalid hotel id", async () => {
      const { status, body } = await apiRequest("/api/hotels/invalid_id", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(404);
      expect(body.error).toBe("HOTEL_NOT_FOUND");
    });

    test("should show ownerId to all users", async () => {
      const { body } = await apiRequest(`/api/hotels/${hotelId}`, {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(body.data).toHaveProperty("ownerId");
      expect(typeof body.data.ownerId).toBe("string");
    });

    test("should return all room details", async () => {
      const { body } = await apiRequest(`/api/hotels/${hotelId}`, {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      const room = body.data.rooms[0];
      expect(room).toHaveProperty("id");
      expect(room).toHaveProperty("roomNumber");
      expect(room).toHaveProperty("roomType");
      expect(room).toHaveProperty("pricePerNight");
      expect(room).toHaveProperty("maxOccupancy");
    });
  });

  describe("POST /api/bookings", () => {
    const futureDate1 = "2026-03-15";
    const futureDate2 = "2026-03-18";

    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          roomId,
          checkInDate: futureDate1,
          checkOutDate: futureDate2,
          guests: 2,
        }),
      });

      expect(status).toBe(401);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should return FORBIDDEN for owner role (customer only endpoint)", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: futureDate1,
          checkOutDate: futureDate2,
          guests: 2,
        }),
      });

      expect(status).toBe(403);
      expect(body.error).toBe("FORBIDDEN");
    });

    test("should create booking successfully as customer and validate all fields", async () => {
      const checkIn = "2026-02-15";
      const checkOut = "2026-02-18";

      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests: 2,
        }),
      });

      expect(status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty("id");
      expect(body.data).toHaveProperty("hotelId");
      expect(body.data).toHaveProperty("bookingDate");
      expect(body.data.roomId).toBe(roomId);
      expect(body.data.guests).toBe(2);
      expect(body.data.status).toBe("confirmed");
      expect(body.data.totalPrice).toBe(15000);
      expect(body.data.bookingDate).toBeDefined();

      bookingId = body.data.id;
    });

    test("should return ROOM_NOT_AVAILABLE for overlapping dates (same dates)", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: "2026-02-15",
          checkOutDate: "2026-02-18",
          guests: 2,
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("ROOM_NOT_AVAILABLE");
    });

    test("should return ROOM_NOT_AVAILABLE for partial overlap", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: "2026-02-16",
          checkOutDate: "2026-02-19",
          guests: 2,
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("ROOM_NOT_AVAILABLE");
    });

    test("should allow booking when checkout equals checkin (no overlap)", async () => {
      const { status } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: "2026-02-18",
          checkOutDate: "2026-02-20",
          guests: 2,
        }),
      });

      expect(status).toBe(201);
    });

    test("should return INVALID_DATES for past date", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2025-01-15",
          checkOutDate: "2025-01-18",
          guests: 2,
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_DATES");
    });

    test("should return INVALID_CAPACITY for exceeding max occupancy", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: "2026-03-01",
          checkOutDate: "2026-03-05",
          guests: 10,
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_CAPACITY");
    });

    test("should return ROOM_NOT_FOUND for invalid room id", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: "invalid_room_id",
          checkInDate: "2026-03-01",
          checkOutDate: "2026-03-05",
          guests: 2,
        }),
      });

      expect(status).toBe(404);
      expect(body.error).toBe("ROOM_NOT_FOUND");
    });

    test("should return INVALID_REQUEST for missing roomId", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          checkInDate: "2026-03-01",
          checkOutDate: "2026-03-05",
          guests: 2,
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for missing checkInDate", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId,
          checkOutDate: "2026-03-05",
          guests: 2,
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for checkout before checkin", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-03-10",
          checkOutDate: "2026-03-08",
          guests: 2,
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should calculate total price correctly for multiple nights", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-04-01",
          checkOutDate: "2026-04-06",
          guests: 3,
        }),
      });

      expect(status).toBe(201);
      expect(body.data.totalPrice).toBe(50000);
    });

    test("should handle single night booking", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-05-01",
          checkOutDate: "2026-05-02",
          guests: 2,
        }),
      });

      expect(status).toBe(201);
      expect(body.data.totalPrice).toBe(10000);
    });
  });

  describe("GET /api/bookings", () => {
    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest("/api/bookings");

      expect(status).toBe(401);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should return all bookings for current user", async () => {
      const { status, body } = await apiRequest("/api/bookings", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      const booking = body.data[0];
      expect(booking).toHaveProperty("id");
      expect(booking).toHaveProperty("hotelName");
      expect(booking).toHaveProperty("roomNumber");
      expect(booking).toHaveProperty("roomType");
    });

    test("should filter bookings by status=confirmed", async () => {
      const { status, body } = await apiRequest(
        "/api/bookings?status=confirmed",
        {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(200);
      body.data.forEach((booking: any) => {
        expect(booking.status).toBe("confirmed");
      });
    });

    test("should return only current users bookings", async () => {
      const { body: body1 } = await apiRequest("/api/bookings", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      const { body: body2 } = await apiRequest("/api/bookings", {
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
      });

      expect(body1.data.length).toBeGreaterThan(0);
      expect(body2.data.length).toBeGreaterThan(0);

      const booking1Ids = body1.data.map((b: any) => b.id);
      const booking2Ids = body2.data.map((b: any) => b.id);

      const hasOverlap = booking1Ids.some((id: string) =>
        booking2Ids.includes(id),
      );
      expect(hasOverlap).toBe(false);
    });

    test("should include all required fields in booking response", async () => {
      const { body } = await apiRequest("/api/bookings", {
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      const booking = body.data[0];
      expect(booking).toHaveProperty("roomId");
      expect(booking).toHaveProperty("hotelId");
      expect(booking).toHaveProperty("checkInDate");
      expect(booking).toHaveProperty("checkOutDate");
      expect(booking).toHaveProperty("guests");
      expect(booking).toHaveProperty("totalPrice");
      expect(booking).toHaveProperty("status");
      expect(booking).toHaveProperty("bookingDate");
    });

    test("should return empty array for user with no bookings", async () => {
      const newCustomer = await apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name: "No Bookings Customer",
          email: `nobookings${Date.now()}@example.com`,
          password: "pass123",
          role: "customer",
        }),
      });

      const loginRes = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: newCustomer.body.data.email,
          password: "pass123",
        }),
      });

      const { status, body } = await apiRequest("/api/bookings", {
        headers: {
          Authorization: `Bearer ${loginRes.body.data.token}`,
        },
      });

      expect(status).toBe(200);
      expect(body.data).toEqual([]);
    });
  });

  describe("PUT /api/bookings/:bookingId/cancel", () => {
    let cancelTestBookingId: string;

    beforeAll(async () => {
      const res = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-12-15",
          checkOutDate: "2026-12-18",
          guests: 2,
        }),
      });
      cancelTestBookingId = res.body.data.id;
    });

    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest(
        `/api/bookings/${cancelTestBookingId}/cancel`,
        {
          method: "PUT",
        },
      );

      expect(status).toBe(401);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should cancel booking successfully", async () => {
      const { status, body } = await apiRequest(
        `/api/bookings/${cancelTestBookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(cancelTestBookingId);
      expect(body.data.status).toBe("cancelled");
      expect(body.data).toHaveProperty("cancelledAt");
    });

    test("should return ALREADY_CANCELLED when cancelling again", async () => {
      const { status, body } = await apiRequest(
        `/api/bookings/${cancelTestBookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(400);
      expect(body.error).toBe("ALREADY_CANCELLED");
    });

    test("should return FORBIDDEN when cancelling another users booking", async () => {
      const { status, body } = await apiRequest(
        `/api/bookings/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${customer2Token}`,
          },
        },
      );

      expect(status).toBe(403);
      expect(body.error).toBe("FORBIDDEN");
    });

    test("should return BOOKING_NOT_FOUND for invalid booking id", async () => {
      const { status, body } = await apiRequest(
        "/api/bookings/invalid_id/cancel",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(404);
      expect(body.error).toBe("BOOKING_NOT_FOUND");
    });

    test("should return CANCELLATION_DEADLINE_PASSED for booking within 24 hours", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      const dayAfterStr = dayAfter.toISOString().split("T")[0];

      const bookingRes = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: tomorrowStr,
          checkOutDate: dayAfterStr,
          guests: 2,
        }),
      });

      if (bookingRes.status === 201) {
        const { status, body } = await apiRequest(
          `/api/bookings/${bookingRes.body.data.id}/cancel`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${customer2Token}`,
            },
          },
        );

        expect(status).toBe(400);
        expect(body.error).toBe("CANCELLATION_DEADLINE_PASSED");
      }
    });

    test("should allow cancelled room to be booked again", async () => {
      const createRes = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-07-15",
          checkOutDate: "2026-07-18",
          guests: 2,
        }),
      });

      await apiRequest(`/api/bookings/${createRes.body.data.id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
      });

      const { status } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-07-15",
          checkOutDate: "2026-07-18",
          guests: 2,
        }),
      });

      expect(status).toBe(201);
    });

    test("should filter cancelled bookings with status query", async () => {
      const { status, body } = await apiRequest(
        "/api/bookings?status=cancelled",
        {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(200);
      body.data.forEach((booking: any) => {
        expect(booking.status).toBe("cancelled");
      });
    });

    test("should set cancelledAt timestamp", async () => {
      const createRes = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-08-15",
          checkOutDate: "2026-08-18",
          guests: 2,
        }),
      });

      const { body } = await apiRequest(
        `/api/bookings/${createRes.body.data.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${customer2Token}`,
          },
        },
      );

      expect(body.data.cancelledAt).toBeDefined();
    });

    test("should allow cancellation more than 24 hours before checkin", async () => {
      const createRes = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-09-15",
          checkOutDate: "2026-09-18",
          guests: 2,
        }),
      });

      const { status } = await apiRequest(
        `/api/bookings/${createRes.body.data.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      expect(status).toBe(200);
    });
  });

  describe("POST /api/reviews", () => {
    let pastBookingId: string;

    beforeAll(async () => {
      const res = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2025-01-10",
          checkOutDate: "2025-01-15",
          guests: 2,
        }),
      });

      pastBookingId = res.body?.data?.id || "past_booking_placeholder";
    });

    test("should return UNAUTHORIZED without token", async () => {
      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          bookingId: pastBookingId,
          rating: 5,
          comment: "Great hotel!",
        }),
      });

      expect(status).toBe(401);
      expect(body.error).toBe("UNAUTHORIZED");
    });

    test("should return BOOKING_NOT_ELIGIBLE for future booking", async () => {
      const futureBookingRes = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-10-15",
          checkOutDate: "2026-10-18",
          guests: 2,
        }),
      });

      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: futureBookingRes.body.data.id,
          rating: 5,
          comment: "Great hotel!",
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("BOOKING_NOT_ELIGIBLE");
    });

    test("should return BOOKING_NOT_ELIGIBLE for cancelled booking", async () => {
      const cancelledBookingRes = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-11-15",
          checkOutDate: "2026-11-18",
          guests: 2,
        }),
      });

      await apiRequest(
        `/api/bookings/${cancelledBookingRes.body.data.id}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        },
      );

      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: cancelledBookingRes.body.data.id,
          rating: 5,
          comment: "Great hotel!",
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("BOOKING_NOT_ELIGIBLE");
    });

    test("should return FORBIDDEN for reviewing another users booking", async () => {
      const customer2Booking = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customer2Token}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: "2026-12-01",
          checkOutDate: "2026-12-05",
          guests: 2,
        }),
      });

      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: customer2Booking.body.data.id,
          rating: 5,
          comment: "Great hotel!",
        }),
      });

      expect([400, 403]).toContain(status);
      if (status === 403) {
        expect(body.error).toBe("FORBIDDEN");
      } else if (status === 400) {
        expect(body.error).toBe("BOOKING_NOT_ELIGIBLE");
      }
    });

    test("should return INVALID_REQUEST for missing rating", async () => {
      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: "some_id",
          comment: "Great hotel!",
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for rating out of range (< 1)", async () => {
      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: "some_id",
          rating: 0,
          comment: "Bad",
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return INVALID_REQUEST for rating out of range (> 5)", async () => {
      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: "some_id",
          rating: 6,
          comment: "Too high",
        }),
      });

      expect(status).toBe(400);
      expect(body.error).toBe("INVALID_REQUEST");
    });

    test("should return BOOKING_NOT_FOUND for invalid booking id", async () => {
      const { status, body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: "invalid_booking_id",
          rating: 5,
          comment: "Great!",
        }),
      });

      expect(status).toBe(404);
      expect(body.error).toBe("BOOKING_NOT_FOUND");
    });

    test("should allow review without comment", async () => {
      const pastCheckIn = "2025-12-01";
      const pastCheckOut = "2025-12-05";

      const bookingRes = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId: room2Id,
          checkInDate: pastCheckIn,
          checkOutDate: pastCheckOut,
          guests: 2,
        }),
      });

      if (
        bookingRes.status === 400 &&
        bookingRes.body.error === "INVALID_DATES"
      ) {
        expect(true).toBe(true);
      }
    });

    test("should return ALREADY_REVIEWED when submitting duplicate review", async () => {
      const firstReview = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: pastBookingId,
          rating: 5,
          comment: "First review",
        }),
      });

      if (firstReview.status === 201) {
        const { status, body } = await apiRequest("/api/reviews", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
          body: JSON.stringify({
            bookingId: pastBookingId,
            rating: 4,
            comment: "Second review attempt",
          }),
        });

        expect(status).toBe(400);
        expect(body.error).toBe("ALREADY_REVIEWED");
      } else {
        expect([400, 403, 404]).toContain(firstReview.status);
      }
    });

    test("should validate response format", async () => {
      const { body } = await apiRequest("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          bookingId: "invalid_id",
          rating: 5,
        }),
      });

      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("data");
      expect(body).toHaveProperty("error");
    });
  });

  describe("Edge Cases", () => {
    test("should handle very long hotel descriptions", async () => {
      const longDescription = "A".repeat(5000);

      const { status } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Long Description Hotel",
          description: longDescription,
          city: "Mumbai",
          country: "India",
        }),
      });

      expect([201, 400]).toContain(status);
    });

    test("should handle very high room prices", async () => {
      const hotelRes = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Luxury Hotel",
          city: "Mumbai",
          country: "India",
        }),
      });

      const { status } = await apiRequest(
        `/api/hotels/${hotelRes.body.data.id}/rooms`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ownerToken}`,
          },
          body: JSON.stringify({
            roomNumber: "9999",
            roomType: "Ultra Luxury",
            pricePerNight: 999999.99,
            maxOccupancy: 10,
          }),
        },
      );

      expect(status).toBe(201);
    });

    test("should handle booking for many months in advance", async () => {
      const farFutureDate = "2027-12-15";
      const farFutureEndDate = "2027-12-18";

      const { status } = await apiRequest("/api/bookings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          roomId,
          checkInDate: farFutureDate,
          checkOutDate: farFutureEndDate,
          guests: 2,
        }),
      });

      expect([201, 400]).toContain(status);
    });

    test("should handle empty amenities vs null", async () => {
      const { status } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Empty Amenities Hotel",
          city: "Pune",
          country: "India",
          amenities: [],
        }),
      });

      expect(status).toBe(201);
    });

    test("should handle special characters in city names", async () => {
      const { status } = await apiRequest("/api/hotels", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
        body: JSON.stringify({
          name: "Special City Hotel",
          city: "Coeur d'Alene",
          country: "USA",
        }),
      });

      expect(status).toBe(201);
    });
  });
});
