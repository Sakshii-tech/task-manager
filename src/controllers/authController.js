// src/controllers/authController.js

import AuthService from '../services/authService.js';
import { successResponse } from '../utils/responseHandler.js';

class AuthController {
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      successResponse(res, 201, { message: 'User registered', user });
    } catch (err) {
      next(err);
    }
  }
  
  async login(req, res, next) {
    try {
      const tokens = await AuthService.login(req.body);
      successResponse(res, 200, tokens);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refresh(refreshToken);
      successResponse(res, 200, tokens);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
