import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { MongoLongTermAdapter } from "../../../src/adapters/persistence/MongoLongTermAdapter";
import { User } from "../../../src/domain/entities/User";

let mongoServer: MongoMemoryServer;
let adapter: MongoLongTermAdapter;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  adapter = new MongoLongTermAdapter();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});


describe("MongoLongTermAdapter", () => {

it("creates a user in the database", async () => {
  const user = new User(
    "" as any,
    "testUser",
    "test@email.com",
    "password",
    "photo",
    null
  );

  await adapter.createUser(user);

  const found = await adapter.findByUsername("testUser");

  expect(found).not.toBeNull();
  expect(found!.username).toBe("testUser");
});

it("updates an existing user", async () => {
  const user = new User(
    "" as any,
    "user1",
    "email",
    "pass",
    "photo",
    null
  );

  await adapter.createUser(user);

  const created = await adapter.findByUsername("user1");

  created!.username = "updatedUser";

  await adapter.updateUser(created!);

  const updated = await adapter.findById(created!.id);

  expect(updated!.username).toBe("updatedUser");
});

it("finds user by ID", async () => {
  const user = new User(
    "" as any,
    "user2",
    "email",
    "pass",
    "photo",
    null
  );

  await adapter.createUser(user);

  const created = await adapter.findByUsername("user2");

  const found = await adapter.findById(created!.id);

  expect(found).not.toBeNull();
  expect(found!.id).toBe(created!.id);
});

it("assigns ID if missing in findByUsername", async () => {
  const user = new User(
    "" as any,
    "user3",
    "email",
    "pass",
    "photo",
    null
  );

  await adapter.createUser(user);

  const found = await adapter.findByUsername("user3");

  expect(found!.id).toBeDefined();
});

it("returns all users", async () => {
  await adapter.createUser(new User("" as any, "u1", "e", "p", "", null));
  await adapter.createUser(new User("" as any, "u2", "e", "p", "", null));

  const users = await adapter.getAllUsers();

  expect(users.length).toBe(2);
});

it("deletes a user", async () => {
  const user = new User("" as any, "u3", "e", "p", "", null);

  await adapter.createUser(user);

  const created = await adapter.findByUsername("u3");

  await adapter.deleteUser(created!.id);

  const deleted = await adapter.findById(created!.id);

  expect(deleted).toBeNull();
});
});