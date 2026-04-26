import { useState, useEffect } from 'react';
import { getHealthScore, getAlerts, getSummary, getGoals, runWhatIf } from '../services/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line,
} from 'recharts';
import {
  LuShieldCheck, LuTriangleAlert, LuInfo, LuCircleCheck,
  LuBrain, LuTrendingUp, LuZap, LuCalculator,
} from 'react-icons/lu';
import toast from 'react-hot-toast';
import './Insights.css';

const formatCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Insights() {
  const [healthScore, setHealthScore] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // What-if
  const [whatIfAmount, setWhatIfAmount] = useState('');
  const [whatIfGoal, setWhatIfGoal] = useState('');
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [hRes, aRes, sRes, gRes] = await Promise.all([
          getHealthScore(), getAlerts(), getSummary(), getGoals(),
        ]);
        setHealthScore(hRes.data);
        setAlerts(aRes.data);
        setSummary(sRes.data);
        setGoals(gRes.data);
      } catch {
        toast.error('Failed to load insights');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleWhatIf = async (e) => {
    e.preventDefault();
    if (!whatIfAmount || Number(whatIfAmount) <= 0) return toast.error('Enter a valid amount');
    setSimulating(true);
    try {
      const payload = { monthlySavings: Number(whatIfAmount) };
      if (whatIfGoal) payload.goalId = whatIfGoal;
      const { data } = await runWhatIf(payload);
      setWhatIfResult(data);
    } catch {
      toast.error('Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const alertIconMap = {
    success: <LuCircleCheck />,
    warning: <LuTriangleAlert />,
    danger: <LuTriangleAlert />,
    info: <LuInfo />,
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  // Score ring
  const score = healthScore?.totalScore || 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 65 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="insights-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart Insights</h1>
          <p className="page-subtitle">AI-powered financial analysis</p>
        </div>
      </div>

      {/* Top Row: Health Score + Score Breakdown */}
      <div className="insights-top grid gap-md mb-lg">
        {/* Score Ring */}
        <div className="card score-card">
          <div className="card-header">
            <h3 className="card-title"><LuShieldCheck /> Financial Health</h3>
            <span className={`badge badge-${healthScore?.riskFlag}`}>{healthScore?.riskFlag} risk</span>
          </div>
          <div className="score-ring-wrapper">
            <svg className="score-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(148,163,184,.08)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="score-value">
              <span className="score-number" style={{ color: scoreColor }}>{score}</span>
              <span className="score-max">/100</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><LuBrain /> Score Breakdown</h3>
          </div>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <div className="breakdown-info">
                <span className="breakdown-label">Savings Ratio</span>
                <span className="breakdown-detail">{healthScore?.savingsRatio || 0}% of income saved</span>
              </div>
              <div className="breakdown-score">{healthScore?.breakdown?.savingsScore || 0}<span>/40</span></div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${((healthScore?.breakdown?.savingsScore || 0) / 40) * 100}%` }} />
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-info">
                <span className="breakdown-label">Spending Consistency</span>
                <span className="breakdown-detail">Lower variance = better</span>
              </div>
              <div className="breakdown-score">{healthScore?.breakdown?.consistencyScore || 0}<span>/30</span></div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${((healthScore?.breakdown?.consistencyScore || 0) / 30) * 100}%` }} />
              </div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-info">
                <span className="breakdown-label">Goal Completion</span>
                <span className="breakdown-detail">Progress on savings goals</span>
              </div>
              <div className="breakdown-score">{healthScore?.breakdown?.goalScore || 0}<span>/30</span></div>
              <div className="progress-bar">
                <div className="fill" style={{ width: `${((healthScore?.breakdown?.goalScore || 0) / 30) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Expenses Bar Chart */}
      {summary?.monthlyTrend?.length > 0 && (
        <div className="card mb-lg">
          <div className="card-header">
            <h3 className="card-title"><LuTrendingUp /> Monthly Expenses</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summary.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.08)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{}}
                formatter={(v) => formatCurrency(v)}
              />
              <Bar dataKey="expense" fill="#f87171" radius={[6, 6, 0, 0]} barSize={32} />
              <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom: Alerts + What-if */}
      <div className="insights-bottom grid gap-md">
        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><LuZap /> Smart Alerts</h3>
          </div>
          <div className="alerts-list">
            {alerts.map((a, i) => (
              <div key={i} className={`alert alert-${a.type}`}>
                <span className="alert-icon">{alertIconMap[a.type]}</span>
                <span>{a.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What-if Simulation */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><LuCalculator /> What-If Simulation</h3>
          </div>
          <p className="whatif-desc">What if I save a certain amount every month?</p>
          <form onSubmit={handleWhatIf} className="whatif-form">
            <div className="input-group">
              <label className="input-label">Monthly Savings (₹)</label>
              <input
                className="input-field"
                type="number"
                placeholder="e.g. 5000"
                value={whatIfAmount}
                onChange={(e) => setWhatIfAmount(e.target.value)}
                min="1"
                required
              />
            </div>
            {goals.length > 0 && (
              <div className="input-group">
                <label className="input-label">Towards Goal (optional)</label>
                <select className="input-field" value={whatIfGoal} onChange={(e) => setWhatIfGoal(e.target.value)}>
                  <option value="">None</option>
                  {goals.map((g) => <option key={g.id} value={g.id}>{g.goal_name}</option>)}
                </select>
              </div>
            )}
            <button className="btn btn-primary btn-block" type="submit" disabled={simulating}>
              {simulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </form>

          {whatIfResult && (
            <div className="whatif-results mt-lg animate-slide-up">
              <div className="whatif-stat">
                <span className="whatif-stat-label">Current Balance</span>
                <span className="whatif-stat-value">{formatCurrency(whatIfResult.currentBalance)}</span>
              </div>
              {whatIfResult.goal && (
                <div className="whatif-goal-info">
                  <div className="whatif-stat">
                    <span className="whatif-stat-label">Months to "{whatIfResult.goal.name}"</span>
                    <span className="whatif-stat-value">{whatIfResult.goal.monthsToGoal} months</span>
                  </div>
                  <div className="whatif-stat">
                    <span className="whatif-stat-label">Estimated Completion</span>
                    <span className="whatif-stat-value">{whatIfResult.goal.estimatedDate}</span>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={whatIfResult.projections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.08)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Month', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{}}
                    formatter={(v) => formatCurrency(v)}
                  />
                  <Line type="monotone" dataKey="balance" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
