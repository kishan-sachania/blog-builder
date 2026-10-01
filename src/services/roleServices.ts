import { Role } from "../../models";

const getRole = async (role: string) => {
    const ResponseRole = await Role.findOne({ name: role });
    return ResponseRole
}

export { getRole }