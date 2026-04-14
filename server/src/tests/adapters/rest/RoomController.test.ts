import request from "supertest";
import express from "express";
import RoomController from "../../../adapters/rest/RoomController";

const mockRoomService = {
  createRoom: jest.fn(),
  joinRoom: jest.fn()
};

const mockAuthAdapter = {
  verifyToken: jest.fn()
};

function createApp() {
  const app = express();
  app.use(express.json());

  const controller = new RoomController(
    mockRoomService as any,
    mockAuthAdapter as any
  );

  app.post("/create", (req, res) => controller.createRoom(req, res));
  app.post("/join", (req, res) => controller.joinRoom(req, res));

  return app;
}

describe("RoomController.createRoom", () => {
  it("returns 401 if no userId", async () => {
    const app = createApp();

    mockAuthAdapter.verifyToken.mockReturnValue(null);

    const res = await request(app)
      .post("/create")
      .send({ gameCode: "ABC" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("creates room successfully", async () => {
    const app = createApp();

    mockAuthAdapter.verifyToken.mockReturnValue({ userId: "user1" });
    mockRoomService.createRoom.mockResolvedValue(undefined);

    const res = await request(app)
        .post("/create")
        .set("Authorization", "Bearer token")
        .send({ gameCode: "ABC" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Room created successfully");

    expect(mockRoomService.createRoom).toHaveBeenCalledWith("ABC", "user1");
  });

  it("returns 500 if service throws", async () => {
  const app = createApp();

  mockAuthAdapter.verifyToken.mockReturnValue({ userId: "user1" });
  mockRoomService.createRoom.mockRejectedValue(new Error("fail"));

  const res = await request(app)
    .post("/create")
    .set("Authorization", "Bearer token")
    .send({ gameCode: "ABC" });

  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Failed to create room");
});


});

describe("RoomController.joinRoom", () => {
  it("returns 401 if unauthorized", async () => {
    const app = createApp();

    mockAuthAdapter.verifyToken.mockReturnValue(null);

    const res = await request(app)
      .post("/join")
      .send({ gameCode: "ABC" });

    expect(res.status).toBe(401);
  });

  it("joins room successfully", async () => {
  const app = createApp();

  mockAuthAdapter.verifyToken.mockReturnValue({ userId: "user1" });
  mockRoomService.joinRoom.mockResolvedValue(undefined);

  const res = await request(app)
    .post("/join")
    .set("Authorization", "Bearer token")
    .send({ gameCode: "ABC" });

  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Joined room successfully");

  expect(mockRoomService.joinRoom).toHaveBeenCalledWith("ABC", "user1");
});

it("returns 500 on join failure", async () => {
  const app = createApp();

  mockAuthAdapter.verifyToken.mockReturnValue({ userId: "user1" });
  mockRoomService.joinRoom.mockRejectedValue(new Error("fail"));

  const res = await request(app)
    .post("/join")
    .set("Authorization", "Bearer token")
    .send({ gameCode: "ABC" });

  expect(res.status).toBe(500);
  expect(res.body.error).toBe("Failed to join room");
});
});