const express = require('express');
const supabase = require('../config/supabase');
const authenticate = require('../middleware/auth');

const router = express.Router();

// All routes below require authentication
router.use(authenticate);

// ──────────────────────────────── CREATE ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    if (!amount || !type || !category || !date) {
      return res.status(400).json({ error: 'amount, type, category, and date are required.' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ user_id: req.user.id, amount: Number(amount), type, category, date, notes }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Create transaction error:', err.message);
    res.status(500).json({ error: 'Failed to create transaction.' });
  }
});

// ──────────────────────────────── READ ALL ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, type, startDate, endDate, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (category) query = query.eq('category', category);
    if (type)     query = query.eq('type', type);
    if (startDate) query = query.gte('date', startDate);
    if (endDate)   query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Fetch transactions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// ──────────────────────────────── READ ONE ──────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Transaction not found.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transaction.' });
  }
});

// ──────────────────────────────── UPDATE ────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const { data, error } = await supabase
      .from('transactions')
      .update({ amount: Number(amount), type, category, date, notes })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Transaction not found.' });

    res.json(data);
  } catch (err) {
    console.error('Update transaction error:', err.message);
    res.status(500).json({ error: 'Failed to update transaction.' });
  }
});

// ──────────────────────────────── DELETE ────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    console.error('Delete transaction error:', err.message);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

module.exports = router;
