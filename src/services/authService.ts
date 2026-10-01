import { User } from "../../models/user";
import { getRole } from "./roleServices";


const getUsers = async () => {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return users;
};

const createUser = async (payload: any) => {
    const { name, email, password } = payload;
    const role = await getRole(payload.role);
    if (!role) {
        throw new Error(`Role '${payload.role}' not found`);
    }

    const isUserExists = await User.findOne({ email });
    if (isUserExists) {
        throw new Error("User already exists");
    }
    const user = await User.create({ name, email, role: role._id, password });
    return user;
};

const getUserByEmail = async (email: string) => {
    const user = await User.findOne({ email });
    return user;
};

export { getUsers, createUser, getUserByEmail };
