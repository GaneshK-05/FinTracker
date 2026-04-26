const express = require('express');
const supabase = require('../config/supabase');
const authenticate = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ──────────────────────────────── CREATE GOAL ───────────────────────────
router.post('/', async (req, res) => {
  try {
    const { goal_name, target_amount, current_amount = 0, deadline } = req.body;

    if (!goal_name || !target_amount || !deadline) {
      return res.status(400).json({ error: 'goal_name, target_amount, and deadline are required.' });
    }

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: req.user.id,
        goal_name,
        target_amount: Number(target_amount),
        current_amount: Number(current_amount),
        deadline,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Create goal error:', err.message);
    res.status(500).json({ error: 'Failed to create goal.' });
  }
});

// ──────────────────────────────── READ ALL ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('deadline', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals.' });
  }
});

// ──────────────────────────────── UPDATE GOAL ───────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { goal_name, target_amount, current_amount, deadline } = req.body;

    const updates = {};
    if (goal_name !== undefined)     updates.goal_name = goal_name;
    if (target_amount !== undefined)  updates.target_amount = Number(target_amount);
    if (current_amount !== undefined) updates.current_amount = Number(current_amount);
    if (deadline !== undefined)       updates.deadline = deadline;

    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Goal not found.' });

    res.json(data);
  } catch (err) {
    console.error('Update goal error:', err.message);
    res.status(500).json({ error: 'Failed to update goal.' });
  }
});

// ──────────────────────────────── DELETE GOAL ───────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ message: 'Goal deleted.' });
  } catch (err) {
    console.error('Delete goal error:', err.message);
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

module.exports = router;
