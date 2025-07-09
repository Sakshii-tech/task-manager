import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15d' }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '15d' }
  );
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
