import React, { useState } from 'react';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';

export default function AddKRSForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    chapter: '',
    section: '',
    full_text: '',
    summary: '',
    category: '',
    tags: '',
    related_cases: '',
    related_krs: '',
    effective_date: '',
    amended_date: ''
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
      const krsData = {
        ...formData,
        category: formData.category ? formData.category.split(',').map(c => c.trim()) : [],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        related_krs: formData.related_krs ? formData.related_krs.split(',').map(k => k.trim()) : [],
        effective_date: formData.effective_date || null,
        amended_date: formData.amended_date || null
      };

      const response = await fetch('/.netlify/functions/add-krs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(krsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add KRS code');
      }

      setSuccess(true);
      setFormData({
        code: '',
        title: '',
        chapter: '',
        section: '',
        full_text: '',
        summary: '',
        category: '',
        tags: '',
        related_cases: '',
        related_krs: '',
        effective_date: '',
        amended_date: ''
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
        <FileText className="w-6 h-6" />
        Add KRS Code
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
          KRS Code added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">KRS Code *</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., 189.394"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Chapter</label>
            <input
              type="text"
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
              placeholder="e.g., 189 - Traffic Regulations"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Operating motor vehicle under influence of alcohol or drugs"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Full Text *</label>
          <textarea
            name="full_text"
            value={formData.full_text}
            onChange={handleChange}
            rows="8"
            placeholder="Paste the full text of the statute..."
            required
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Summary</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="3"
            placeholder="Brief summary of what this statute covers..."
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Categories (comma-separated)</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Traffic, DUI, Criminal"
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
              placeholder="e.g., alcohol, impaired driving, misdemeanor"
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
            placeholder="e.g., 189.520, 189.580"
            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Effective Date</label>
            <input
              type="date"
              name="effective_date"
              value={formData.effective_date}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2">Last Amended Date</label>
            <input
              type="date"
              name="amended_date"
              value={formData.amended_date}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Adding KRS Code...' : 'Add KRS Code'}
        </button>
      </form>
    </div>
  );
}
