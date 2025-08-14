const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../auth');
const router = express.Router();

// list active ads (public)
router.get('/', async (req,res)=>{
  const ads = await db('ads').where({ active: true }).select();
  res.json(ads);
});

// complete a view and reward
router.post('/:id/view-complete', authMiddleware, async (req,res)=>{
  const adId = req.params.id;
  const userId = req.user.id;
  const ip = req.ip;
  const ua = req.headers['user-agent'] || '';

  const ad = await db('ads').where({ id: adId }).first();
  if(!ad) return res.status(404).json({ error: 'Ad not found' });

  // basic daily limit anti-fraud
  const today = new Date(); today.setHours(0,0,0,0);
  const viewsToday = await db('ad_views').where('user_id', userId).andWhere('ad_id', adId).andWhere('viewed_at', '>=', today).count('id as c').first();
  if(viewsToday.c >= ad.daily_limit) return res.status(400).json({ error: 'Daily limit reached for this ad' });

  await db.transaction(async trx =>{
    await trx('ad_views').insert({ user_id: userId, ad_id: adId, rewarded: ad.reward, ip, user_agent: ua });
    const user = await trx('users').where({ id: userId }).first();
    const newBal = Number(user.balance) + Number(ad.reward);
    await trx('users').where({ id: userId }).update({ balance: newBal });
    await trx('ads').where({ id: adId }).increment('impressions',1);
    await trx('transactions').insert({ user_id: userId, type: 'earn', amount: ad.reward, balance_after: newBal, meta: JSON.stringify({ adId }) });
    res.json({ success: true, reward: ad.reward, balance: newBal });
  });
});

module.exports = router;
