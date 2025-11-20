import { useState } from 'react';
import LegalSearch from './components/LegalSearch';

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
            Comprehensive database of case law, statutes, and constitutional rights
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
                Search our comprehensive database of case law, Kentucky statutes, federal law,
                and constitutional protections.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
              <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg border border-slate-700">
                <div className="text-3xl mb-3">⚖️</div>
                <h3 className="text-xl font-bold text-white mb-2">178 Case Law Entries</h3>
                <p className="text-slate-300">
                  Supreme Court and appellate decisions on search, seizure, arrest, and constitutional rights.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg border border-slate-700">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">280 Kentucky Statutes</h3>
                <p className="text-slate-300">
                  Kentucky Revised Statutes (KRS) covering criminal law, traffic, civil rights, and procedures.
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur p-6 rounded-lg border border-slate-700">
                <div className="text-3xl mb-3">🇺🇸</div>
                <h3 className="text-xl font-bold text-white mb-2">Federal Law & Constitution</h3>
                <p className="text-slate-300">
                  Bill of Rights, constitutional amendments, and federal civil rights statutes.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg"
            >
              Search Legal Database →
            </button>

            {/* Quick Stats */}
            <div className="mt-12 flex justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">178</div>
                <div className="text-sm text-slate-400">Cases</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">280</div>
                <div className="text-sm text-slate-400">KRS Codes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400">27</div>
                <div className="text-sm text-slate-400">Amendments</div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-16 bg-slate-800/30 backdrop-blur border border-slate-700 rounded-lg p-8 text-left max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">How to Use</h3>
              <ol className="space-y-3 text-slate-300">
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Enter keywords or describe your legal situation (e.g., "search warrant", "traffic stop", "probable cause")</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Our database searches across case law, statutes, and constitutional provisions</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>Review the actual court decisions and legal text that apply to your situation</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Read the full text, holdings, and reasoning from authoritative legal sources</span>
                </li>
              </ol>
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
            <LegalSearch />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-700 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400">
          <p className="text-sm">
            This platform provides legal information, not legal advice.
            Always consult with a qualified attorney for specific legal guidance.
          </p>
          <p className="text-xs mt-2">
            Database: {178} cases • 280 KRS codes • Federal statutes • U.S. Constitution
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
