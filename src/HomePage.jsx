import { useState } from 'react';
import ScenarioSearch from './components/ScenarioSearch';

function HomePage() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">
            🏛️ Kentucky Legal Research Platform
          </h1>
          <p className="text-slate-300 mt-2">
            AI-powered legal rights assistance with comprehensive case law and statutes
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {!showSearch ? (
          /* Landing Page */
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Know Your Rights
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Get instant AI-powered analysis of legal scenarios with citations from 178 cases,
                280 KRS codes, and federal statutes.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
              <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg border border-slate-700">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-xl font-bold text-white mb-2">178 Case Law Entries</h3>
                <p className="text-slate-300">
                  Supreme Court and appellate decisions covering search, seizure, arrest, and constitutional rights.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg border border-slate-700">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">280 KRS Codes</h3>
                <p className="text-slate-300">
                  Complete Kentucky Revised Statutes covering criminal law, traffic, civil rights, and more.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg border border-slate-700">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Analysis</h3>
                <p className="text-slate-300">
                  Claude AI analyzes your scenario and provides relevant cases, statutes, and guidance.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
            >
              Analyze a Legal Scenario →
            </button>

            {/* Quick Stats */}
            <div className="mt-12 flex justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">178</div>
                <div className="text-sm text-slate-400">Case Law</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">280</div>
                <div className="text-sm text-slate-400">KRS Codes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">4</div>
                <div className="text-sm text-slate-400">Federal Statutes</div>
              </div>
            </div>
          </div>
        ) : (
          /* Search Interface */
          <div>
            <button
              onClick={() => setShowSearch(false)}
              className="mb-6 text-slate-300 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
            <ScenarioSearch />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-700 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400">
          <p className="text-sm">
            This platform provides legal information, not legal advice.
            Consult with a qualified attorney for specific legal guidance.
          </p>
          <p className="text-xs mt-2">
            Database: 178 cases • 280 KRS codes • 4 federal statutes
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
