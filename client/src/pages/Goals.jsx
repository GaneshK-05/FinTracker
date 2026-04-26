import { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/api';
import toast from 'react-hot-toast';
import { LuPlus, LuPencil, LuTrash2, LuX, LuTarget, LuCalendar, LuTrophy, LuPiggyBank } from 'react-icons/lu';
import './Goals.css';

const formatCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Add Savings modal state
  const [showAddSavings, setShowAddSavings] = useState(false);
  const [addSavingsGoal, setAddSavingsGoal] = useState(null);
  const [addSavingsAmount, setAddSavingsAmount] = useState('');
  const [addingSavings, setAddingSavings] = useState(false);

  const emptyForm = { goal_name: '', target_amount: '', current_amount: '0', deadline: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await getGoals();
      setGoals(data);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({
      goal_name: goal.goal_name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateGoal(editing.id, form);
        toast.success('Goal updated');
      } else {
        await createGoal(form);
        toast.success('Goal created');
      }
      setShowModal(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await deleteGoal(id);
      toast.success('Goal deleted');
      fetchGoals();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // Open the Add Savings modal for a specific goal
  const openAddSavings = (goal) => {
    setAddSavingsGoal(goal);
    setAddSavingsAmount('');
    setShowAddSavings(true);
  };

  // Submit the manually entered savings amount
  const handleAddSavingsSubmit = async (e) => {
    e.preventDefault();
    if (!addSavingsAmount || Number(addSavingsAmount) <= 0) {
      return toast.error('Enter a valid amount');
    }
    setAddingSavings(true);
    try {
      const newAmount = Number(addSavingsGoal.current_amount) + Number(addSavingsAmount);
      await updateGoal(addSavingsGoal.id, { current_amount: newAmount });
      toast.success(`Added ${formatCurrency(addSavingsAmount)} to "${addSavingsGoal.goal_name}"`);
      setShowAddSavings(false);
      fetchGoals();
    } catch {
      toast.error('Failed to add savings');
    } finally {
      setAddingSavings(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="goals-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">{goals.length} active goals</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <LuPlus /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🎯</div>
          <h3>No goals yet</h3>
          <p>Set your first savings goal to start tracking progress.</p>
          <button className="btn btn-primary mt-md" onClick={openCreate}><LuPlus /> Create Goal</button>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100));
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / 86400000);
            const isComplete = progress >= 100;

            return (
              <div key={goal.id} className={`goal-card card animate-slide-up ${isComplete ? 'complete' : ''}`}>
                {isComplete && <div className="goal-badge"><LuTrophy /> Completed!</div>}
                <div className="goal-header">
                  <div className="goal-icon">
                    <LuTarget />
                  </div>
                  <div className="goal-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(goal)}><LuPencil /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(goal.id)}><LuTrash2 /></button>
                  </div>
                </div>

                <h3 className="goal-name">{goal.goal_name}</h3>

                <div className="goal-amounts">
                  <span className="goal-current">{formatCurrency(goal.current_amount)}</span>
                  <span className="goal-target">/ {formatCurrency(goal.target_amount)}</span>
                </div>

                <div className="progress-bar">
                  <div className="fill" style={{ width: `${progress}%`, background: isComplete ? 'var(--accent-success)' : undefined }} />
                </div>

                <div className="goal-footer">
                  <span className="goal-progress-text">{progress}% achieved</span>
                  <span className="goal-deadline">
                    <LuCalendar />
                    {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                  </span>
                </div>

                {!isComplete && (
                  <button className="btn btn-secondary btn-sm btn-block mt-md" onClick={() => openAddSavings(goal)}>
                    <LuPlus /> Add Savings
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Goal' : 'New Goal'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><LuX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Goal Name</label>
                <input className="input-field" type="text" name="goal_name" value={form.goal_name} onChange={handleChange} placeholder="e.g. Emergency Fund" required />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Target Amount (₹)</label>
                  <input className="input-field" type="number" name="target_amount" value={form.target_amount} onChange={handleChange} min="1" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Current Amount (₹)</label>
                  <input className="input-field" type="number" name="current_amount" value={form.current_amount} onChange={handleChange} min="0" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Deadline</label>
                <input className="input-field" type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
              </div>
              <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      {showAddSavings && addSavingsGoal && (
        <div className="modal-overlay" onClick={() => setShowAddSavings(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Savings</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddSavings(false)}><LuX /></button>
            </div>

            <div className="add-savings-info">
              <div className="add-savings-icon">
                <LuPiggyBank />
              </div>
              <div>
                <h4 className="add-savings-goal-name">{addSavingsGoal.goal_name}</h4>
                <p className="add-savings-progress">
                  {formatCurrency(addSavingsGoal.current_amount)} of {formatCurrency(addSavingsGoal.target_amount)} saved
                </p>
              </div>
            </div>

            <div className="progress-bar mb-lg">
              <div
                className="fill"
                style={{ width: `${Math.min(100, Math.round((Number(addSavingsGoal.current_amount) / Number(addSavingsGoal.target_amount)) * 100))}%` }}
              />
            </div>

            <form onSubmit={handleAddSavingsSubmit}>
              <div className="input-group">
                <label className="input-label">Amount to Add (₹)</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="Enter amount manually"
                  value={addSavingsAmount}
                  onChange={(e) => setAddSavingsAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                  autoFocus
                />
                <small className="input-help">
                  Remaining: {formatCurrency(Math.max(0, Number(addSavingsGoal.target_amount) - Number(addSavingsGoal.current_amount)))}
                </small>
              </div>
              <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSavings(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addingSavings}>
                  <LuPiggyBank /> {addingSavings ? 'Adding...' : 'Add Savings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
