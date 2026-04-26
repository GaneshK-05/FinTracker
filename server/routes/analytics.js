const express = require('express');
const supabase = require('../config/supabase');
const authenticate = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ──────────────────────────────── SUMMARY ───────────────────────────────
// Returns total income, total expense, savings, category breakdown, and monthly trends.
router.get('/summary', async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'income') totalIncome += amt;
      else totalExpense += amt;

      // Category breakdown (expenses only)
      if (t.type === 'expense') {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + amt;
      }

      // Monthly trend
      const month = t.date.slice(0, 7); // YYYY-MM
      if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
      if (t.type === 'income') monthlyMap[month].income += amt;
      else monthlyMap[month].expense += amt;
    });

    const categoryBreakdown = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));

    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({ month, ...values }));

    res.json({
      totalIncome,
      totalExpense,
      savings: totalIncome - totalExpense,
      categoryBreakdown,
      monthlyTrend,
    });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// ──────────────────────────────── FINANCIAL HEALTH SCORE ────────────────
router.get('/health-score', async (req, res) => {
  try {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id);

    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', req.user.id);

    let totalIncome = 0;
    let totalExpense = 0;

    (transactions || []).forEach((t) => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      else totalExpense += Number(t.amount);
    });

    // 1. Savings ratio score (0-40)
    const savingsRatio = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
    const savingsScore = Math.min(40, Math.round(savingsRatio * 100));

    // 2. Spending consistency (0-30)  — lower std dev = more consistent
    const monthlyExpenses = {};
    (transactions || []).filter((t) => t.type === 'expense').forEach((t) => {
      const m = t.date.slice(0, 7);
      monthlyExpenses[m] = (monthlyExpenses[m] || 0) + Number(t.amount);
    });
    const expVals = Object.values(monthlyExpenses);
    let consistencyScore = 30; // default if not enough data
    if (expVals.length >= 2) {
      const mean = expVals.reduce((a, b) => a + b, 0) / expVals.length;
      const variance = expVals.reduce((s, v) => s + (v - mean) ** 2, 0) / expVals.length;
      const cv = mean > 0 ? Math.sqrt(variance) / mean : 0; // coefficient of variation
      consistencyScore = Math.max(0, Math.round(30 * (1 - Math.min(cv, 1))));
    }

    // 3. Goal completion score (0-30)
    let goalScore = 15; // default if no goals
    if (goals && goals.length > 0) {
      const avgProgress = goals.reduce((sum, g) => {
        return sum + Math.min(1, Number(g.current_amount) / Number(g.target_amount));
      }, 0) / goals.length;
      goalScore = Math.round(avgProgress * 30);
    }

    const totalScore = savingsScore + consistencyScore + goalScore;

    // Risk flag
    let riskFlag = 'low';
    if (totalScore < 40) riskFlag = 'high';
    else if (totalScore < 65) riskFlag = 'medium';

    res.json({
      totalScore,
      breakdown: { savingsScore, consistencyScore, goalScore },
      riskFlag,
      savingsRatio: Math.round(savingsRatio * 100),
    });
  } catch (err) {
    console.error('Health score error:', err.message);
    res.status(500).json({ error: 'Failed to calculate health score.' });
  }
});

// ──────────────────────────────── SMART ALERTS ──────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id);

    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', req.user.id);

    const alerts = [];

    // --- Weekly spending spike ---
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 86400000);
    const twoWeeksAgo = new Date(now - 14 * 86400000);

    const thisWeek = (transactions || [])
      .filter((t) => t.type === 'expense' && new Date(t.date) >= oneWeekAgo)
      .reduce((s, t) => s + Number(t.amount), 0);

    const lastWeek = (transactions || [])
      .filter((t) => t.type === 'expense' && new Date(t.date) >= twoWeeksAgo && new Date(t.date) < oneWeekAgo)
      .reduce((s, t) => s + Number(t.amount), 0);

    if (lastWeek > 0 && thisWeek > lastWeek * 1.3) {
      const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
      alerts.push({
        type: 'warning',
        message: `You spent ${pct}% more this week compared to last week.`,
      });
    }

    // --- No savings warning ---
    let totalIncome = 0;
    let totalExpense = 0;
    (transactions || []).forEach((t) => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      else totalExpense += Number(t.amount);
    });
    if (totalExpense >= totalIncome && totalIncome > 0) {
      alerts.push({ type: 'danger', message: 'You have no net savings. Try to cut expenses.' });
    }

    // --- Goal deadline approaching ---
    (goals || []).forEach((g) => {
      const deadline = new Date(g.deadline);
      const daysLeft = Math.ceil((deadline - now) / 86400000);
      const progress = Number(g.current_amount) / Number(g.target_amount);
      if (daysLeft <= 30 && daysLeft > 0 && progress < 0.9) {
        alerts.push({
          type: 'info',
          message: `Goal "${g.goal_name}" is due in ${daysLeft} days but only ${Math.round(progress * 100)}% complete.`,
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({ type: 'success', message: 'Looking great! No alerts right now.' });
    }

    res.json(alerts);
  } catch (err) {
    console.error('Alerts error:', err.message);
    res.status(500).json({ error: 'Failed to generate alerts.' });
  }
});

// ──────────────────────────────── WHAT-IF SIMULATION ────────────────────
router.post('/what-if', async (req, res) => {
  try {
    const { monthlySavings, goalId } = req.body;

    if (!monthlySavings || monthlySavings <= 0) {
      return res.status(400).json({ error: 'monthlySavings must be a positive number.' });
    }

    // Get current balance
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id);

    let totalIncome = 0;
    let totalExpense = 0;
    (transactions || []).forEach((t) => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      else totalExpense += Number(t.amount);
    });
    const currentBalance = totalIncome - totalExpense;

    const result = {
      currentBalance,
      monthlySavings: Number(monthlySavings),
      projections: [],
    };

    // Project 12 months
    for (let i = 1; i <= 12; i++) {
      result.projections.push({
        month: i,
        balance: currentBalance + Number(monthlySavings) * i,
      });
    }

    // If goalId provided, estimate time to reach that goal
    if (goalId) {
      const { data: goal } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', req.user.id)
        .single();

      if (goal) {
        const remaining = Number(goal.target_amount) - Number(goal.current_amount);
        const monthsToGoal = remaining > 0 ? Math.ceil(remaining / Number(monthlySavings)) : 0;
        result.goal = {
          name: goal.goal_name,
          remaining,
          monthsToGoal,
          estimatedDate: new Date(Date.now() + monthsToGoal * 30 * 86400000).toISOString().slice(0, 10),
        };
      }
    }

    res.json(result);
  } catch (err) {
    console.error('What-if error:', err.message);
    res.status(500).json({ error: 'Simulation failed.' });
  }
});

module.exports = router;
