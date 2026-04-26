import { useState, useEffect } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/api';
import toast from 'react-hot-toast';
import { LuPlus, LuPencil, LuTrash2, LuSearch, LuX, LuFilter } from 'react-icons/lu';
import './Transactions.css';

const CATEGORIES = ['food', 'rent', 'travel', 'shopping', 'entertainment', 'health', 'education', 'utilities', 'salary', 'freelance', 'investment', 'other'];

const formatCurrency = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);

  const emptyForm = { amount: '', type: 'expense', category: 'food', date: new Date().toISOString().slice(0, 10), notes: '' };
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const { data } = await getTransactions(params);
      setTransactions(data);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [filters]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (txn) => {
    setEditing(txn);
    setForm({
      amount: txn.amount,
      type: txn.type,
      category: txn.category,
      date: txn.date,
      notes: txn.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateTransaction(editing.id, form);
        toast.success('Transaction updated');
      } else {
        await createTransaction(form);
        toast.success('Transaction added');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Deleted');
      fetchAll();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const clearFilters = () => setFilters({ type: '', category: '', startDate: '', endDate: '' });

  return (
    <div className="transactions-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{transactions.length} records found</p>
        </div>
        <div className="flex gap-sm">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <LuFilter /> Filters
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <LuPlus /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-bar card animate-slide-up">
          <div className="filters-grid">
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input-field" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input-field" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                <option value="">All</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">From</label>
              <input className="input-field" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">To</label>
              <input className="input-field" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-ghost btn-sm mt-sm" onClick={clearFilters}>Clear Filters</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : transactions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">💸</div>
          <h3>No transactions yet</h3>
          <p>Start by adding your first income or expense.</p>
          <button className="btn btn-primary mt-md" onClick={openCreate}><LuPlus /> Add Transaction</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="animate-fade-in">
                  <td>{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><span className="category-tag">{txn.category}</span></td>
                  <td><span className={`badge badge-${txn.type}`}>{txn.type}</span></td>
                  <td className={`txn-amount ${txn.type}`}>{txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}</td>
                  <td className="txn-notes">{txn.notes || '—'}</td>
                  <td>
                    <div className="flex gap-sm">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(txn)} title="Edit"><LuPencil /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(txn.id)} title="Delete"><LuTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Transaction' : 'Add Transaction'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><LuX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Amount (₹)</label>
                <input className="input-field" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0" min="0" step="0.01" required />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Type</label>
                  <select className="input-field" name="type" value={form.type} onChange={handleChange}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="input-field" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input className="input-field" type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">Notes (optional)</label>
                <textarea className="input-field" name="notes" value={form.notes} onChange={handleChange} rows="2" placeholder="Add a note..." />
              </div>
              <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
