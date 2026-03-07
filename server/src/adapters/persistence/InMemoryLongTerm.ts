import { User } from "../../domain/entities/User";
import ILongTermStoragePort from "../../ports/ILongTermStoragePort";

export default class InMemoryLongTermStorageAdapter implements ILongTermStoragePort {
    findById(id: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    private users: Map<string, User> = new Map<string, User>();
    
    getUserById(id: string): Promise<User | null> {
        return Promise.resolve(this.users.get(id) || null);
    }

    createUser(user: User): Promise<void> {
        this.users.set(user.id, user);
        return Promise.resolve();
    }

    getAllUsers(): Promise<User[]> {
        return Promise.resolve(Array.from(this.users.values()));
    }

    async findByUsername(username: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.username === username) {
                return Promise.resolve(user);
            }
        }

        return Promise.resolve(new User("id123", username, username, "", null));
    }

    deleteUser(id: string): Promise<void> {
        this.users.delete(id);
        return Promise.resolve();
    }
    
}