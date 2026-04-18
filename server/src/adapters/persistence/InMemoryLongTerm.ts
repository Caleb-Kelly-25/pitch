import { User } from "../../domain/entities/User";
import ILongTermStoragePort from "../../ports/ILongTermStoragePort";

// In-memory implementation of the long-term storage adapter
// This is the mock implementation for testing purposes.
export default class InMemoryLongTermStorageAdapter implements ILongTermStoragePort {
    private users: Map<string, User> = new Map<string, User>();
    
    findById(id: string): Promise<User | null> {
        return Promise.resolve(this.users.get(id) || null);
    }

    createUser(user: User): Promise<void> {
        user.id = crypto.randomUUID();
        this.users.set(user.id, user);
        return Promise.resolve();
    }

    getAllUsers(): Promise<User[]> {
        return Promise.resolve(Array.from(this.users.values()));
    }

    updateUser(user: User): Promise<void> {
        this.users.set(user.id, user);
        return Promise.resolve();
    }

    async findByUsername(username: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.username === username) return user;
        }
        return null;
    }

    deleteUser(id: string): Promise<void> {
        this.users.delete(id);
        return Promise.resolve();
    }
    
}