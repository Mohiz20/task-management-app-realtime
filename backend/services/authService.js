const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function validateEmail(email) {
  return typeof email === 'string' && email.includes('@');
}
function validatePassword(pw) {
  return typeof pw === 'string' && pw.length >= 6;
}

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 6 chars' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash, name }
    });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Invalid password' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
