import UserService from "../../application/UserService";
import { User } from "../../domain/entities/User";

function makeUser(id = "u1", username = "alice"): User {
    return new User(id, username, username, "hashed", null, null);
}

describe("UserService.createUser", () => {
    it("calls repo.createUser then returns the result of findByUsername", async () => {
        const user = makeUser();
        const repo = {
            createUser: jest.fn().mockResolvedValue(undefined),
            findByUsername: jest.fn().mockResolvedValue(user),
            findById: jest.fn(),
            getAllUsers: jest.fn(),
        };
        const service = new UserService(repo as any);
        const result = await service.createUser(user);

        expect(repo.createUser).toHaveBeenCalledWith(user);
        expect(repo.findByUsername).toHaveBeenCalledWith(user.username);
        expect(result).toBe(user);
    });

    it("returns null when findByUsername returns null after creation", async () => {
        const repo = {
            createUser: jest.fn().mockResolvedValue(undefined),
            findByUsername: jest.fn().mockResolvedValue(null),
            findById: jest.fn(),
            getAllUsers: jest.fn(),
        };
        const result = await new UserService(repo as any).createUser(makeUser());
        expect(result).toBeNull();
    });
});

describe("UserService.getUserByUsername", () => {
    it("delegates to repo.findByUsername", async () => {
        const user = makeUser();
        const repo = { findByUsername: jest.fn().mockResolvedValue(user), createUser: jest.fn(), findById: jest.fn(), getAllUsers: jest.fn() };
        const result = await new UserService(repo as any).getUserByUsername("alice");
        expect(repo.findByUsername).toHaveBeenCalledWith("alice");
        expect(result).toBe(user);
    });
});

describe("UserService.findById", () => {
    it("delegates to repo.findById", async () => {
        const user = makeUser();
        const repo = { findById: jest.fn().mockResolvedValue(user), createUser: jest.fn(), findByUsername: jest.fn(), getAllUsers: jest.fn() };
        const result = await new UserService(repo as any).findById("u1");
        expect(repo.findById).toHaveBeenCalledWith("u1");
        expect(result).toBe(user);
    });

    it("returns null when user does not exist", async () => {
        const repo = { findById: jest.fn().mockResolvedValue(null), createUser: jest.fn(), findByUsername: jest.fn(), getAllUsers: jest.fn() };
        expect(await new UserService(repo as any).findById("ghost")).toBeNull();
    });
});

describe("UserService.getAllUsers", () => {
    it("delegates to repo.getAllUsers", async () => {
        const users = [makeUser("u1"), makeUser("u2", "bob")];
        const repo = { getAllUsers: jest.fn().mockResolvedValue(users), createUser: jest.fn(), findById: jest.fn(), findByUsername: jest.fn() };
        const result = await new UserService(repo as any).getAllUsers();
        expect(result).toHaveLength(2);
    });
});
