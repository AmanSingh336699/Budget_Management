import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password 
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  try {
    console.log("--- LOGIN ATTEMPT ---");
    const { email, password } = req.body;
    console.log(`1. Email received: '${email}'`);
    console.log(`2. Password received: ${password ? '(Hidden but present)' : 'MISSING!'}`);

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("3. Result: User NOT FOUND in database.");
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log(`3. Result: User found (ID: ${user._id})`);

    const isMatch = await user.matchPassword(password);
    console.log(`4. Password Match Result: ${isMatch}`);

    if (isMatch) {
      console.log("5. Login SUCCESSFUL!");
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      console.log("5. Login FAILED: Passwords did not match.");
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
