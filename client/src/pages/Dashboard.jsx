import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSummary, getHealthScore, getAlerts, getTransactions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import {
  LuTrendingUp, LuTrendingDown, LuWallet, LuPiggyBank,
  LuArrowRight, LuShieldCheck, LuTriangleAlert, LuInfo, LuCircleCheck,
} from 'react-icons/lu';
import './Dashboard.css';

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#f87171', '#fb923c', '#a78bfa'];

const formatCurrency = (n) => {
  if (n === undefined || n === null) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentTxn, setRecentTxn] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, healthRes, alertRes, txnRes] = await Promise.all([
          getSummary(),
          getHealthScore(),
          getAlerts(),
          getTransactions({ limit: 5 }),
        ]);
        setSummary(sumRes.data);
        setHealthScore(healthRes.data);
        setAlerts(alertRes.data);
        setRecentTxn(txnRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>;
  }

  const alertIconMap = {
    success: <LuCircleCheck />,
    warning: <LuTriangleAlert />,
    danger: <LuTriangleAlert />,
    info: <LuInfo />,
  };

  return (
    <div className="dashboard">
      {/* Greeting */}
      <div className="dashboard-greeting animate-slide-left">
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
        <p>Here's your financial overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4 gap-md mb-lg">
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,.12)', color: '#818cf8' }}>
            <LuWallet />
          </div>
          <div className="stat-value">{formatCurrency(summary?.totalIncome)}</div>
          <div className="stat-label">Total Income</div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="stat-icon" style={{ background: 'rgba(248,113,113,.12)', color: '#f87171' }}>
            <LuTrendingDown />
          </div>
          <div className="stat-value">{formatCurrency(summary?.totalExpense)}</div>
          <div className="stat-label">Total Expenses</div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '160ms' }}>
          <div className="stat-icon" style={{ background: 'rgba(52,211,153,.12)', color: '#34d399' }}>
            <LuPiggyBank />
          </div>
          <div className="stat-value">{formatCurrency(summary?.savings)}</div>
          <div className="stat-label">Net Savings</div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '240ms' }}>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,.12)', color: '#818cf8' }}>
            <LuShieldCheck />
          </div>
          <div className="stat-value">{healthScore?.totalScore || 0}<span className="stat-unit">/100</span></div>
          <div className="stat-label">Health Score</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts grid gap-md mb-lg">
        {/* Spending by Category — Pie */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Spending by Category</h3>
          </div>
          {summary?.categoryBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={summary.categoryBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {summary.categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{}}
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No expense data yet</div>
          )}
          {summary?.categoryBreakdown?.length > 0 && (
            <div className="chart-legend">
              {summary.categoryBreakdown.map((item, i) => (
                <div key={item.category} className="legend-item">
                  <span className="legend-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="legend-label">{item.category}</span>
                  <span className="legend-value">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trend — Area Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Trend</h3>
          </div>
          {summary?.monthlyTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={summary.monthlyTrend}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.08)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{}}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="income" stroke="#6366f1" fill="url(#incomeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#f87171" fill="url(#expenseGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No trend data yet</div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Alerts */}
      <div className="dashboard-bottom grid gap-md">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Transactions</h3>
            <Link to="/transactions" className="btn btn-ghost btn-sm">
              View All <LuArrowRight />
            </Link>
          </div>
          {recentTxn.length > 0 ? (
            <div className="recent-txn-list">
              {recentTxn.map((txn) => (
                <div key={txn.id} className="recent-txn-item">
                  <div className="recent-txn-left">
                    <div className={`recent-txn-icon ${txn.type}`}>
                      {txn.type === 'income' ? <LuTrendingUp /> : <LuTrendingDown />}
                    </div>
                    <div>
                      <div className="recent-txn-category">{txn.category}</div>
                      <div className="recent-txn-date">{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </div>
                  <div className={`recent-txn-amount ${txn.type}`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="chart-empty">No transactions yet</div>
          )}
        </div>

        {/* Smart Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Smart Alerts</h3>
          </div>
          <div className="alerts-list">
            {alerts.map((alert, i) => (
              <div key={i} className={`alert alert-${alert.type}`}>
                <span className="alert-icon">{alertIconMap[alert.type]}</span>
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
