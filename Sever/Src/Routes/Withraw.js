const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');
const router = express.Router();
require('dotenv').config();
const FEE_RATE = Number(process.env.WITHDRAW_FEE_RATE||0.1);
const MIN = Number(process.env.WITHDRAW_MIN||20000);

router.post('/', authMiddleware, async (req,res)=>{
  const { amount, method, detail } = req.body;
  const userId = req.user.id;
  const amt = Number(amount);
  if(isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if(amt < MIN) return res.status(400).json({ error: `Min withdraw is ${MIN}` });

  const user = await db('users').where({ id: userId }).first();
  if(Number(user.balance) < amt) return res.status(400).json({ error: 'Insufficient balance' });

  const fee = Math.round(amt * FEE_RATE);
  const net = amt - fee;

  await db.transaction(async trx =>{
    const [wr] = await trx('withdraw_requests').insert({ user_id: userId, amount: amt, fee, net, method, detail, status: 'pending' }).returning(['id','amount','fee','net','status']);
    const newBal = Number(user.balance) - amt;
    await trx('users').where({ id: userId }).update({ balance: newBal });
    await trx('transactions').insert({ user_id: userId, type: 'withdraw_request', amount: -amt, balance_after: newBal, meta: JSON.stringify({ withdrawId: wr.id }) });
    res.json({ success: true, withdraw: wr, balance: newBal });
  });
});

module.exports = router;
