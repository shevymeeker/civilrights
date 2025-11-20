import React, { useState } from 'react';
import { Search, AlertCircle, BookOpen, FileText, Flag, ChevronDown, ChevronUp, Loader } from 'lucide-react';

export default function LegalSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [expandedCase, setExpandedCase] = useState(null);
  const [expandedKRS, setExpandedKRS] = useState(null);
  const [expandedFederal, setExpandedFederal] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (query.trim().length < 3) {
      setError('Please enter at least 3 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setExpandedCase(null);
    setExpandedKRS(null);
    setExpandedFederal(null);

    try {
      const response = await fetch('/.netlify/functions/search-legal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const CaseCard = ({ caseData, index }) => {
    const isExpanded = expandedCase === index;

    return (
      <div className="bg-slate-700/50 rounded-lg p-5 border border-slate-600">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-white text-lg">
              {caseData.case_name || caseData.full_title}
            </h4>
            {caseData.citation && (
              <p className="text-slate-400 text-sm mt-1">{caseData.citation}</p>
            )}
            {caseData.court && caseData.year && (
              <p className="text-slate-400 text-sm">{caseData.court}, {caseData.year}</p>
            )}
          </div>
          <button
            onClick={() => setExpandedCase(isExpanded ? null : index)}
            className="flex-shrink-0 text-blue-400 hover:text-blue-300"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Holding (always visible) */}
        {caseData.holding && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <p className="text-sm font-semibold text-slate-300 mb-1">Holding:</p>
            <p className="text-slate-200">{caseData.holding}</p>
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-slate-600">
            {caseData.facts && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-2">Facts:</p>
                <p className="text-slate-200 text-sm leading-relaxed">{caseData.facts}</p>
              </div>
            )}
            {caseData.issue && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-2">Issue:</p>
                <p className="text-slate-200 text-sm leading-relaxed">{caseData.issue}</p>
              </div>
            )}
            {caseData.discussion && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-2">Discussion:</p>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{caseData.discussion}</p>
              </div>
            )}
            {caseData.category && (
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                  {caseData.category}
                </span>
                {caseData.tags && caseData.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const KRSCard = ({ krsData, index }) => {
    const isExpanded = expandedKRS === index;

    return (
      <div className="bg-slate-700/50 rounded-lg p-5 border border-slate-600">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-white text-lg">
              KRS {krsData.code}
            </h4>
            <p className="text-slate-200 mt-1">{krsData.title}</p>
            {krsData.chapter && (
              <p className="text-slate-400 text-sm mt-1">Chapter: {krsData.chapter}</p>
            )}
          </div>
          <button
            onClick={() => setExpandedKRS(isExpanded ? null : index)}
            className="flex-shrink-0 text-yellow-400 hover:text-yellow-300"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {krsData.summary && !isExpanded && (
          <p className="text-slate-300 text-sm mt-3">{krsData.summary}</p>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            {krsData.full_text && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-2">Full Text:</p>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{krsData.full_text}</p>
              </div>
            )}
            {krsData.category && krsData.category.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {krsData.category.map((cat, i) => (
                  <span key={i} className="px-3 py-1 bg-yellow-900/50 text-yellow-300 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const FederalCard = ({ federalData, index }) => {
    const isExpanded = expandedFederal === index;

    return (
      <div className="bg-slate-700/50 rounded-lg p-5 border border-slate-600">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h4 className="font-bold text-white text-lg">
              {federalData.code}
            </h4>
            <p className="text-slate-200 mt-1">{federalData.heading}</p>
          </div>
          <button
            onClick={() => setExpandedFederal(isExpanded ? null : index)}
            className="flex-shrink-0 text-green-400 hover:text-green-300"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {federalData.summary && !isExpanded && (
          <p className="text-slate-300 text-sm mt-3">{federalData.summary}</p>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-600">
            {federalData.full_text && (
              <div>
                <p className="text-sm font-semibold text-slate-300 mb-2">Full Text:</p>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{federalData.full_text}</p>
              </div>
            )}
            {federalData.category && federalData.category.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-4">
                {federalData.category.map((cat, i) => (
                  <span key={i} className="px-3 py-1 bg-green-900/50 text-green-300 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Box */}
      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Search className="w-6 h-6" />
          Legal Database Search
        </h2>
        <p className="text-slate-300 mb-6">
          Search across 178 cases, 280 Kentucky statutes, federal law, and the Constitution.
          Enter keywords, case names, statute numbers, or describe your situation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Examples: &quot;search warrant&quot;, &quot;probable cause&quot;, &quot;traffic stop&quot;, &quot;4th amendment&quot;, &quot;KRS 431&quot;"
              className="w-full bg-slate-900 border-2 border-slate-700 focus:border-blue-500 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || query.trim().length < 3}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Searching database...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Search
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

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300">
              Found <span className="font-bold text-white">{results.total}</span> results for "{results.query}"
            </p>
          </div>

          {/* Case Law Results */}
          {results.results.cases && results.results.cases.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-400" />
                Case Law ({results.results.cases.length})
              </h3>
              <div className="space-y-4">
                {results.results.cases.map((caseData, i) => (
                  <CaseCard key={i} caseData={caseData} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* KRS Results */}
          {results.results.krs && results.results.krs.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-yellow-400" />
                Kentucky Statutes ({results.results.krs.length})
              </h3>
              <div className="space-y-4">
                {results.results.krs.map((krsData, i) => (
                  <KRSCard key={i} krsData={krsData} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Federal Results */}
          {results.results.federal && results.results.federal.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Flag className="w-6 h-6 text-green-400" />
                Federal Statutes ({results.results.federal.length})
              </h3>
              <div className="space-y-4">
                {results.results.federal.map((federalData, i) => (
                  <FederalCard key={i} federalData={federalData} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {results.total === 0 && (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-slate-300 text-lg">
                No results found for "{results.query}"
              </p>
              <p className="text-slate-400 mt-2">
                Try different keywords or broader search terms
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mt-8">
            <p className="text-yellow-200 text-sm">
              <strong>Legal Disclaimer:</strong> This information is for educational purposes only and does not constitute legal advice.
              Always consult with a licensed attorney for specific legal guidance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
