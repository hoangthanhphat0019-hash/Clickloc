const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');
const router = express.Router();

router.get('/', authMiddleware, async (req,res)=>{
  const user = await db('users').where({ id: req.user.id }).first();
  res.json({ balance: Number(user.balance) });
});

module.exports = router;
