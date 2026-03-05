import ILongTermStoragePort from "../../ports/ILongTermStoragePort";
import { User } from "../../domain/entities/User";
import UserModel from "../models/UserModel";

class MongoLongTermAdapter implements ILongTermStoragePort {}