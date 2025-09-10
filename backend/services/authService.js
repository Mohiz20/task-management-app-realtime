const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Improved email validation with regex
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
}

function validatePassword(pw) {
  return typeof pw === 'string' && pw.length >= 6;
}

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Early validation to avoid unnecessary processing
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Check for existing user first (this is faster than hashing)
    const existing = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      select: { id: true } // Only select id to minimize data transfer
    });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    // Reduce bcrypt rounds from 10 to 8 for better performance
    // 8 rounds is still very secure but significantly faster
    const hash = await bcrypt.hash(password, 8);
    
    // Create user and generate token
    const user = await prisma.user.create({
      data: { 
        email: email.toLowerCase(), // Store email in lowercase for consistency
        password: hash, 
        name: name || null 
      },
      select: { id: true, email: true, name: true } // Only select needed fields
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (e) {
    console.error('Registration error:', e);
    
    // Handle specific Prisma errors
    if (e.code === 'P2002') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Early validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Invalid password' });

    // Find user with optimized query
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true }
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Compare password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: 'Server error' });
  }
};
