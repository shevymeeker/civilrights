import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Plus } from 'lucide-react';

export default function AddCaseForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    case_name: '',
    citation: '',
    full_title: '',
    year: '',
    court: 'U.S. Supreme Court',
    facts: '',
    issue: '',
    holding: '',
    discussion: '',
    category: '',
    tags: '',
    related_krs: '',
    importance: 3
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Transform form data
      const caseData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        importance: parseInt(formData.importance),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        related_krs: formData.related_krs ? formData.related_krs.split(',').map(k => k.trim()) : []
      };

      const response = await fetch('/.netlify/functions/add-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(caseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add case');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        case_name: '',
        citation: '',
        full_title: '',
        year: '',
        court: 'U.S. Supreme Court',
        facts: '',
        issue: '',
        holding: '',
        discussion: '',
        category: '',
        tags: '',
        related_krs: '',
        importance: 3
      });

      if (onSuccess) onSuccess();

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Plus className="w-6 h-6" />
        Add Case Law
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2 text-red-200">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-center gap-2 text-green-200">
          <CheckCircle className="w-5 h-5" />
          Case added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Case Name *</label>
            <input
              type="text"
              name="case_name"
              value={formData.case_name}
              onChange={handleChange}
              placeholder="e.g., Terry v. Ohio"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Citation</label>
            <input
              type="text"
              name="citation"
              value={formData.citation}
              onChange={handleChange}
              placeholder="e.g., 392 U.S. 1"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Full Title *</label>
          <input
            type="text"
            name="full_title"
            value={formData.full_title}
            onChange={handleChange}
            placeholder="e.g., Terry v. Ohio, 392 U.S. 1 (1968)"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="1968"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Court</label>
            <select
              name="court"
              value={formData.court}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            >
              <option>U.S. Supreme Court</option>
              <option>Kentucky Supreme Court</option>
              <option>Kentucky Court of Appeals</option>
              <option>6th Circuit</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Importance</label>
            <select
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            >
              <option value="5">★★★★★ Critical (Landmark)</option>
              <option value="4">★★★★ Very Important</option>
              <option value="3">★★★ Important</option>
              <option value="2">★★ Relevant</option>
              <option value="1">★ Minor</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Facts</label>
          <textarea
            name="facts"
            value={formData.facts}
            onChange={handleChange}
            rows="4"
            placeholder="Describe what happened in this case..."
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Issue</label>
          <textarea
            name="issue"
            value={formData.issue}
            onChange={handleChange}
            rows="2"
            placeholder="What legal question did the court address?"
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Holding *</label>
          <textarea
            name="holding"
            value={formData.holding}
            onChange={handleChange}
            rows="3"
            placeholder="How did the court rule?"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Discussion</label>
          <textarea
            name="discussion"
            value={formData.discussion}
            onChange={handleChange}
            rows="6"
            placeholder="Court's reasoning and analysis..."
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., SEARCH, ARREST, TRAFFIC"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., stop-and-frisk, reasonable suspicion, terry stop"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Related KRS Codes (comma-separated)</label>
          <input
            type="text"
            name="related_krs"
            value={formData.related_krs}
            onChange={handleChange}
            placeholder="e.g., 189.394, 431.015"
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Adding Case...' : 'Add Case Law'}
        </button>
      </form>
    </div>
  );
}
