const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_secure';

async function createToken(user){
  const payload = { id: user.id, email: user.email, is_admin: user.is_admin };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ error: 'No token' });
  const token = h.replace('Bearer ','');
  try{
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch(e){
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { createToken, authMiddleware };
