// src/services/userService.js

import { UserModel } from '../models/userModel.js';

class UserService {
    async getAll() {
        return UserModel.getAll();
    }

    async getById(id) {
        const user = await UserModel.getById(id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        return user;
    }

    async update(id, data) {
        const user = await UserModel.update(id, data);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        return user;
    }

    async remove(id) {
        const user = await UserModel.delete(id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        return user;
    }
}

export default new UserService();
