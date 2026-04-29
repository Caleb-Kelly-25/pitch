import UserController from "../../../adapters/rest/UserController";
import { User } from "../../../domain/entities/User";

function makeReq(body: object, headers: object = {}): any {
    return { body, headers: { authorization: "Bearer valid-token", ...headers } };
}

function makeRes(): any {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
}

function makeUserService(overrides: Partial<ReturnType<typeof defaultUserService>> = {}) {
    return { ...defaultUserService(), ...overrides };
}

function defaultUserService() {
    return {
        getUserByUsername: jest.fn().mockResolvedValue(null),
        createUser:        jest.fn().mockResolvedValue(null),
        findById:          jest.fn().mockResolvedValue(null),
        getAllUsers:        jest.fn().mockResolvedValue([]),
    };
}

function makeAuthAdapter(overrides: object = {}) {
    return {
        verifyToken: jest.fn().mockReturnValue({ userId: "u1" }),
        signToken:   jest.fn().mockReturnValue("signed-token"),
        ...overrides,
    };
}

// ── login ─────────────────────────────────────────────────────────────────────

describe("UserController.login", () => {
    it("returns 400 when username or password is missing", async () => {
        const ctrl = new UserController(makeUserService() as any, makeAuthAdapter() as any);
        const res = makeRes();
        await ctrl.login(makeReq({ username: "alice" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 401 when the user does not exist", async () => {
        const ctrl = new UserController(
            makeUserService({ getUserByUsername: jest.fn().mockResolvedValue(null) }) as any,
            makeAuthAdapter() as any,
        );
        const res = makeRes();
        await ctrl.login(makeReq({ username: "ghost", password: "pw" }), res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 401 when the password is wrong", async () => {
        const bcrypt = require("bcrypt");
        const user = new User("u1", "alice", "alice", await bcrypt.hash("correct", 10), null, null);
        const ctrl = new UserController(
            makeUserService({ getUserByUsername: jest.fn().mockResolvedValue(user) }) as any,
            makeAuthAdapter() as any,
        );
        const res = makeRes();
        await ctrl.login(makeReq({ username: "alice", password: "wrong" }), res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 200 with a token on successful login", async () => {
        const bcrypt = require("bcrypt");
        const user = new User("u1", "alice", "alice", await bcrypt.hash("pw", 10), null, null);
        const ctrl = new UserController(
            makeUserService({ getUserByUsername: jest.fn().mockResolvedValue(user) }) as any,
            makeAuthAdapter() as any,
        );
        const res = makeRes();
        await ctrl.login(makeReq({ username: "alice", password: "pw" }), res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "signed-token" }));
    });
});

// ── signup ────────────────────────────────────────────────────────────────────

describe("UserController.signup", () => {
    it("returns 400 when username or password is missing", async () => {
        const ctrl = new UserController(makeUserService() as any, makeAuthAdapter() as any);
        const res = makeRes();
        await ctrl.signup(makeReq({ username: "alice" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when the username already exists", async () => {
        const existing = new User("u1", "alice", "alice", "hash", null, null);
        const ctrl = new UserController(
            makeUserService({ getUserByUsername: jest.fn().mockResolvedValue(existing) }) as any,
            makeAuthAdapter() as any,
        );
        const res = makeRes();
        await ctrl.signup(makeReq({ username: "alice", password: "pw" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when credentials fail validation rules", async () => {
        const ctrl = new UserController(makeUserService() as any, makeAuthAdapter() as any);
        const res = makeRes();
        await ctrl.signup(makeReq({ username: "usr", password: "pw" }), res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 500 when createUser returns null", async () => {
        const ctrl = new UserController(
            makeUserService({ createUser: jest.fn().mockResolvedValue(null) }) as any,
            makeAuthAdapter() as any,
        );
        const res = makeRes();
        await ctrl.signup(makeReq({ username: "newuser1", password: "Password1!" }), res);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it("returns 201 with a token on successful signup", async () => {
        const newUser = new User("u2", "newuser1", "newuser1", "hash", null, null);
        const ctrl = new UserController(
            makeUserService({ createUser: jest.fn().mockResolvedValue(newUser) }) as any,
            makeAuthAdapter() as any,
        );
        const res = makeRes();
        await ctrl.signup(makeReq({ username: "newuser1", password: "Password1!" }), res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "signed-token" }));
    });
});
