import React, { useState } from 'react';
import { Search, AlertCircle, BookOpen, FileText, Loader } from 'lucide-react';

export default function ScenarioSearch() {
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (scenario.trim().length < 10) {
      setError('Please provide a more detailed scenario (at least 10 characters)');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/.netlify/functions/analyze-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scenario })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze scenario');
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
          <Search className="w-8 h-8" />
          Scenario Analysis
        </h2>
        <p className="text-slate-300 mb-6">
          Describe a traffic stop or police encounter scenario, and get AI-powered legal analysis
          based on Kentucky law and Supreme Court precedent.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 font-semibold">
              Your Scenario
            </label>
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              rows="6"
              placeholder="Example: I was pulled over for a broken taillight. The officer asked to search my car. I said no. He said he was going to call a K9 unit and make me wait. What are my rights?"
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none"
            />
            <p className="text-slate-400 text-sm mt-1">
              Be specific: What happened? What did the officer say/do? What did you say/do?
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || scenario.trim().length < 10}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Analyzing scenario...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze My Scenario
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          {/* AI Analysis */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" />
              Legal Analysis
            </h3>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {result.analysis}
              </div>
            </div>
          </div>

          {/* Related Case Law */}
          {result.relatedCases && result.relatedCases.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                Relevant Case Law
              </h3>
              <div className="space-y-4">
                {result.relatedCases.map((c, i) => (
                  <div key={i} className="border-l-4 border-green-500 pl-4 py-2">
                    <h4 className="font-semibold text-white">
                      {c.case_name || 'Untitled Case'}
                    </h4>
                    {c.citation && (
                      <p className="text-slate-400 text-sm">{c.citation}</p>
                    )}
                    {c.holding && (
                      <p className="text-slate-300 text-sm mt-2">{c.holding}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related KRS Codes */}
          {result.relatedKRS && result.relatedKRS.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                Relevant Kentucky Statutes
              </h3>
              <div className="space-y-4">
                {result.relatedKRS.map((k, i) => (
                  <div key={i} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <h4 className="font-semibold text-white">
                      KRS {k.code}
                    </h4>
                    <p className="text-slate-300">{k.title}</p>
                    {k.summary && (
                      <p className="text-slate-400 text-sm mt-2">{k.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Legal Disclaimer:</strong> This analysis is for educational purposes only and does not constitute legal advice.
              In any police encounter, physical compliance is mandatory. Your remedy is in court, not on the roadside.
              Consult with a licensed attorney for specific legal guidance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
