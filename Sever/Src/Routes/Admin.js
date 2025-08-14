const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');
const router = express.Router();

router.use(authMiddleware);
router.use(async (req,res,next)=>{
  if(!req.user.is_admin) return res.status(403).json({ error: 'Admin only' });
  next();
});

router.get('/withdraws', async (req,res)=>{
  const rows = await db('withdraw_requests').orderBy('created_at','desc').limit(200);
  res.json(rows);
});

router.post('/withdraws/:id/approve', async (req,res)=>{
  const id = req.params.id;
  await db.transaction(async trx=>{
    const wr = await trx('withdraw_requests').where({ id }).first();
    if(!wr) return res.status(404).json({ error: 'Not found' });
    if(wr.status !== 'pending') return res.status(400).json({ error: 'Already processed' });
    await trx('withdraw_requests').where({ id }).update({ status: 'approved', processed_at: trx.fn.now() });
    await trx('transactions').insert({ user_id: wr.user_id, type: 'withdraw_fee', amount: wr.fee, balance_after: null, meta: JSON.stringify({ withdrawId: id }) });
    res.json({ success: true });
  });
});

router.post('/withdraws/:id/reject', async (req,res)=>{
  const id = req.params.id;
  await db.transaction(async trx=>{
    const wr = await trx('withdraw_requests').where({ id }).first();
    if(!wr) return res.status(404).json({ error: 'Not found' });
    if(wr.status !== 'pending') return res.status(400).json({ error: 'Already processed' });
    const user = await trx('users').where({ id: wr.user_id }).first();
    const newBal = Number(user.balance) + Number(wr.amount);
    await trx('users').where({ id: wr.user_id }).update({ balance: newBal });
    await trx('transactions').insert({ user_id: wr.user_id, type: 'withdraw_rejected_return', amount: wr.amount, balance_after: newBal, meta: JSON.stringify({ withdrawId: id }) });
    await trx('withdraw_requests').where({ id }).update({ status: 'rejected', processed_at: trx.fn.now() });
    res.json({ success: true });
  });
});

module.exports = router;
