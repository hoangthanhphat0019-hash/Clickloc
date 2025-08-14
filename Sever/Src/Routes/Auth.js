const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const { createToken } = require('../auth');
const router = express.Router();

router.post('/register', async (req,res)=>{
  const { email, password, name } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing' });
  const exists = await db('users').where({ email }).first();
  if(exists) return res.status(400).json({ error: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const [user] = await db('users').insert({ email, password_hash: hash, name }).returning(['id','email','name','is_admin']);
  const token = await createToken(user);
  res.json({ user, token });
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await db('users').where({ email }).first();
  if(!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if(!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = await createToken(user);
  res.json({ user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin }, token });
});

module.exports = router;
