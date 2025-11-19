import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, BookOpen, Target, FileText, ChevronRight, Clock, Camera, Phone } from 'lucide-react';

export default function TrafficStopSimulator() {
  const [mode, setMode] = useState('home');
  const [scenarioStep, setScenarioStep] = useState(0);
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [docData, setDocData] = useState(() => {
    // Load saved documentation from localStorage on mount
    const saved = localStorage.getItem('trafficStopDoc');
    return saved ? JSON.parse(saved) : {};
  });

  // Save docData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('trafficStopDoc', JSON.stringify(docData));
  }, [docData]);

  const handleClearDocumentation = () => {
    // Ask for confirmation before clearing
    if (window.confirm("Are you sure you want to clear all documentation data? This cannot be undone.")) {
      setDocData({});
      // Your useEffect will automatically update localStorage
    }
  };

  const threeLines = [
    "Officer, I am exercising my right to remain silent.",
    "I do not consent to any searches.",
    "Am I being detained, or am I free to go?"
  ];

  const scenarios = [
    {
      officer: "Do you know why I pulled you over?",
      correct: 0,
      options: [
        { text: '"Officer, I am exercising my right to remain silent."', legal: true, explanation: "Never admit guilt. This invokes your Fifth Amendment right." },
        { text: '"I was going a bit fast, sorry."', legal: false, explanation: "You just admitted guilt. This becomes evidence." },
        { text: '"I was hoping you could tell me why you pulled me over."', legal: true, explanation: "Forces them to articulate the reason. Also acceptable." }
      ]
    },
    {
      officer: "Where are you coming from tonight?",
      correct: 0,
      options: [
        { text: '"I am exercising my right to remain silent."', legal: true, explanation: "Travel questions are not legally required. This ends it." },
        { text: '"Just heading home from work."', legal: false, explanation: "Voluntary information. Gets catalogued as an indicator." },
        { text: '"Why do you need to know that?"', legal: false, explanation: "Sounds confrontational. Still answered the question by engaging. Use the script." }
      ]
    },
    {
      officer: "Mind if I take a look in the vehicle?",
      correct: 1,
      options: [
        { text: '"I guess that\'s fine."', legal: false, explanation: "You just consented. If they had probable cause, they wouldn't ask." },
        { text: '"I do not consent to any searches."', legal: true, explanation: "Perfect. If they had grounds for a warrant, they wouldn't need your consent." },
        { text: '"Do you have a warrant?"', legal: false, explanation: "Sounds like you're hiding something. Just state no consent." }
      ]
    },
    {
      officer: "You seem really nervous. Why is that?",
      correct: 0,
      options: [
        { text: '"I am exercising my right to remain silent."', legal: true, explanation: "Nervousness is used as an indicator. Don't explain yourself." },
        { text: '"I\'m not nervous, I\'m just tired."', legal: false, explanation: "Now you're both nervous AND making excuses. Use the script." },
        { text: '"Being pulled over makes me nervous."', legal: false, explanation: "Reasonable, but still voluntary information. Don't engage." }
      ]
    },
    {
      officer: "If you have nothing to hide, why not let me search?",
      correct: 1,
      options: [
        { text: '"I have nothing to hide, go ahead."', legal: false, explanation: "You consented. They won. Your rights mean nothing now." },
        { text: '"I do not consent to any searches."', legal: true, explanation: "The question is manipulation. Repeat the script." },
        { text: '"Because it\'s my right to refuse."', legal: false, explanation: "You're explaining yourself. Don't. Just state no consent." }
      ]
    },
    {
      officer: "I'm going to call for a K-9 unit.",
      correct: 2,
      options: [
        { text: '"Fine, I\'ll wait."', legal: false, explanation: "You're consenting to the extension. Ask if you're detained." },
        { text: '"You can\'t do that!"', legal: false, explanation: "They can if they have reasonable suspicion. Ask if you're detained." },
        { text: '"Am I being detained, or am I free to go?"', legal: true, explanation: "Forces them to articulate legal basis. Rodriguez limits apply." }
      ]
    },
    {
      officer: "Step out of the vehicle.",
      correct: 0,
      options: [
        { text: 'Comply silently, exit the vehicle', legal: true, explanation: "Pennsylvania v. Mimms. This is a lawful order you must obey." },
        { text: '"Why? What did I do?"', legal: false, explanation: "Lawful order. You must comply. Ask questions later." },
        { text: '"I don\'t have to do that."', legal: false, explanation: "Wrong. You do. Comply with lawful orders." }
      ]
    },
    {
      officer: "Can I see your phone?",
      correct: 1,
      options: [
        { text: 'Hand over unlocked phone', legal: false, explanation: "Riley v. California. They need a warrant. Never unlock it." },
        { text: '"I do not consent to any searches of my phone."', legal: true, explanation: "Perfect. Your phone requires a warrant." },
        { text: '"It\'s dead."', legal: false, explanation: "Lying to police. Just state no consent." }
      ]
    }
  ];

  const renderHome = () => (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Kentucky Traffic Stop Simulator</h1>
          <p className="text-slate-400 text-lg">Train on the script. Know your rights. Document encounters.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => setMode('learn')}
            className="bg-slate-800 hover:bg-slate-700 p-8 rounded-lg transition-colors border-2 border-slate-700 hover:border-blue-500"
          >
            <BookOpen className="w-12 h-12 mb-4 text-blue-400 mx-auto" />
            <h2 className="text-xl font-bold mb-2">Learn</h2>
            <p className="text-slate-400">Legal framework, case law, and the three sentences</p>
          </button>

          <button
            onClick={() => { setMode('practice'); setScenarioStep(0); setResponses([]); }}
            className="bg-slate-800 hover:bg-slate-700 p-8 rounded-lg transition-colors border-2 border-slate-700 hover:border-blue-500"
          >
            <Target className="w-12 h-12 mb-4 text-green-400 mx-auto" />
            <h2 className="text-xl font-bold mb-2">Practice</h2>
            <p className="text-slate-400">Simulated scenarios to drill the script</p>
          </button>

          <button
            onClick={() => setMode('document')}
            className="bg-slate-800 hover:bg-slate-700 p-8 rounded-lg transition-colors border-2 border-slate-700 hover:border-blue-500"
          >
            <FileText className="w-12 h-12 mb-4 text-yellow-400 mx-auto" />
            <h2 className="text-xl font-bold mb-2">Document</h2>
            <p className="text-slate-400">Record details immediately after a stop</p>
          </button>
        </div>

        <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-2 text-red-400">Critical Reality Check</h3>
              <p className="text-slate-300">
                This tool trains you on legal responses. It provides no physical protection. 
                In any encounter, physical compliance with lawful orders is mandatory. 
                Your remedy is in court, not on the roadside. Stay alive first.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setMode('home')}
          className="mb-6 text-blue-400 hover:text-blue-300"
        >
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-8">Legal Framework</h1>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 border-2 border-green-500">
            <h2 className="text-2xl font-bold mb-4 text-green-400">The Three Sentences</h2>
            <p className="text-slate-300 mb-4">Memorize these. Use only these.</p>
            {threeLines.map((line, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded mb-2 font-mono text-sm">
                {i + 1}. "{line}"
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">What You Must Do (Drivers)</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Pull over safely</li>
              <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Show license, registration, insurance (KRS 186.510)</li>
              <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Exit vehicle if ordered (Pennsylvania v. Mimms)</li>
              <li className="flex gap-2"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> Keep hands visible</li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">What You Don't Have To Do</h2>
            <ul className="space-y-2 text-slate-300">
              <li className="flex gap-2"><XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> Answer destination/origin questions</li>
              <li className="flex gap-2"><XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> Consent to searches</li>
              <li className="flex gap-2"><XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> Stay after stop is completed</li>
              <li className="flex gap-2"><XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> Unlock your phone (Riley v. California)</li>
              <li className="flex gap-2"><XCircle className="w-5 h-5 text-red-400 flex-shrink-0" /> Explain yourself</li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Key Case Law</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="font-bold text-blue-400">Whren v. United States (1996)</h3>
                <p>Any traffic violation, no matter how minor, justifies a stop - even if pretextual.</p>
              </div>
              <div>
                <h3 className="font-bold text-blue-400">Rodriguez v. United States (2015)</h3>
                <p>Stop duration limited to its "mission": ticket, license check, warrants. Any extension requires reasonable suspicion.</p>
              </div>
              <div>
                <h3 className="font-bold text-blue-400">Pennsylvania v. Mimms (1977)</h3>
                <p>Officers can order you out of the car during any traffic stop. You must comply.</p>
              </div>
              <div>
                <h3 className="font-bold text-blue-400">Riley v. California (2014)</h3>
                <p>Police need a warrant to search your phone. Do not unlock it.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">The Interdiction Playbook</h2>
            <p className="text-slate-300 mb-4">What they're trained to do:</p>
            <ol className="space-y-2 text-slate-300 list-decimal list-inside">
              <li>Target Selection: Profile-based indicators before any violation</li>
              <li>Pretext Stop: Follow until minor violation occurs (Whren)</li>
              <li>"Consensual" Interview: Systematic interrogation about travel, work</li>
              <li>Manufacturing Suspicion: Stack indicators (nervousness, air fresheners, "inconsistencies")</li>
              <li>K-9 Gambit: Use stacked indicators to justify dog, then search</li>
            </ol>
          </div>

          <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-red-400">Kentucky Reality</h2>
            <p className="text-slate-300 mb-2">
              42 Kentucky agencies paid for Street Cop Training - banned in multiple states for teaching unconstitutional tactics and promoting violence.
            </p>
            <p className="text-slate-300">
              Kentucky law enforcement gets 100% of civil forfeiture proceeds: 85% to seizing agency, 15% to prosecutors. D- grade from Institute for Justice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPractice = () => {
    if (scenarioStep >= scenarios.length) {
      const correct = responses.filter(r => r).length;
      const total = scenarios.length;
      const percent = Math.round((correct / total) * 100);

      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                {percent >= 80 ? '✓ Strong Performance' : percent >= 60 ? 'Needs Work' : 'Critical Gaps'}
              </h1>
              <p className="text-3xl mb-2">{correct}/{total} correct</p>
              <p className="text-slate-400">{percent}%</p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Results Breakdown</h2>
              <div className="space-y-2">
                {scenarios.map((scenario, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-900 rounded">
                    {responses[i] ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-slate-300">{scenario.officer}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { setScenarioStep(0); setResponses([]); }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Practice Again
              </button>
              <button
                onClick={() => setMode('home')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    const scenario = scenarios[scenarioStep];

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => setMode('home')}
              className="text-blue-400 hover:text-blue-300"
            >
              ← Exit Practice
            </button>
            <span className="text-slate-400">Scenario {scenarioStep + 1}/{scenarios.length}</span>
          </div>

          <div className="bg-slate-800 rounded-lg p-8 mb-6">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-blue-600 rounded-full p-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-2">OFFICER</p>
                <p className="text-xl">{scenario.officer}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-slate-400 mb-4">How do you respond?</p>
              {scenario.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const isCorrect = option.legal;
                    setResponses([...responses, isCorrect]);
                    setFeedback({ correct: isCorrect, explanation: option.explanation });
                  }}
                  className="w-full text-left p-4 bg-slate-900 hover:bg-slate-700 rounded-lg border-2 border-slate-700 hover:border-blue-500 transition-colors"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-4">
            <p className="text-sm text-slate-300">
              <strong>Remember:</strong> The three sentences cover every situation. Repetition is strength, not weakness.
            </p>
          </div>
        </div>

        {/* Feedback Modal */}
        {feedback && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className={`max-w-2xl w-full rounded-lg p-8 ${feedback.correct ? 'bg-green-900/90 border-2 border-green-500' : 'bg-red-900/90 border-2 border-red-500'}`}>
              <div className="flex items-start gap-4 mb-6">
                {feedback.correct ? (
                  <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {feedback.correct ? '✓ CORRECT' : '✗ INCORRECT'}
                  </h2>
                  <p className="text-lg text-slate-200">{feedback.explanation}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedback(null);
                  setScenarioStep(scenarioStep + 1);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDocument = () => (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setMode('home')}
          className="mb-6 text-blue-400 hover:text-blue-300"
        >
          ← Back to Home
        </button>

        <h1 className="text-3xl font-bold mb-2">Document Traffic Stop</h1>
        <p className="text-slate-400 mb-8">Complete this immediately after the encounter. Your memory fades faster than you think.</p>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time & Location
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Date & Time of Stop</label>
                <input
                  type="datetime-local"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  onChange={(e) => setDocData({...docData, datetime: e.target.value})}
                  value={docData.datetime || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Exact Location (street, mile marker, landmarks)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  placeholder="I-64 westbound, mile marker 87, near Exit 86 for Simpsonville"
                  onChange={(e) => setDocData({...docData, location: e.target.value})}
                  value={docData.location || ''}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Officer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Officer Name(s) & Badge Number(s)</label>
                <textarea
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
                  placeholder="Officer J. Smith, Badge #1234"
                  onChange={(e) => setDocData({...docData, officers: e.target.value})}
                  value={docData.officers || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Patrol Car Number(s)</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  placeholder="Unit 456"
                  onChange={(e) => setDocData({...docData, vehicles: e.target.value})}
                  value={docData.vehicles || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Agency</label>
                <input
                  type="text"
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2"
                  placeholder="Kentucky State Police, Daviess County Sheriff, etc."
                  onChange={(e) => setDocData({...docData, agency: e.target.value})}
                  value={docData.agency || ''}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Recording Equipment
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="dashcam"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, dashcam: e.target.checked})}
                  checked={!!docData.dashcam}
                />
                <label htmlFor="dashcam" className="text-slate-300">Dash cam visible on patrol car</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="bodycam"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, bodycam: e.target.checked})}
                  checked={!!docData.bodycam}
                />
                <label htmlFor="bodycam" className="text-slate-300">Body cam visible on officer</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="myrecording"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, myrecording: e.target.checked})}
                  checked={!!docData.myrecording}
                />
                <label htmlFor="myrecording" className="text-slate-300">I recorded the interaction</label>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Timeline of Events</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-32"
              placeholder="10:15 PM - Pulled over&#10;10:16 PM - Officer approached, requested license&#10;10:20 PM - Officer asked about destination, I stated 'I am exercising my right to remain silent'&#10;10:25 PM - Officer requested consent to search, I stated 'I do not consent to any searches'&#10;10:30 PM - Officer returned documents, I asked 'Am I free to go?', was told yes, departed"
              onChange={(e) => setDocData({...docData, timeline: e.target.value})}
              value={docData.timeline || ''}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Officer Questions & Your Responses</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-32"
              placeholder="Officer: 'Where are you headed?'&#10;Me: 'I am exercising my right to remain silent.'&#10;&#10;Officer: 'Mind if I search your vehicle?'&#10;Me: 'I do not consent to any searches.'"
              onChange={(e) => setDocData({...docData, dialogue: e.target.value})}
              value={docData.dialogue || ''}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Search Details (if applicable)</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="searched"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, searched: e.target.checked})}
                  checked={!!docData.searched}
                />
                <label htmlFor="searched" className="text-slate-300">Vehicle was searched</label>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="consented"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, consented: e.target.checked})}
                  checked={!!docData.consented}
                />
                <label htmlFor="consented" className="text-slate-300">I consented to search (if unchecked, search was without consent)</label>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Items removed from vehicle</label>
                <textarea
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
                  onChange={(e) => setDocData({...docData, itemsRemoved: e.target.value})}
                  value={docData.itemsRemoved || ''}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Damage to vehicle</label>
                <textarea
                  className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
                  onChange={(e) => setDocData({...docData, damage: e.target.value})}
                  value={docData.damage || ''}
                />
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="k9"
                  className="w-4 h-4"
                  onChange={(e) => setDocData({...docData, k9: e.target.checked})}
                  checked={!!docData.k9}
                />
                <label htmlFor="k9" className="text-slate-300">K-9 unit was called/used</label>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Witnesses</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-20"
              placeholder="Passenger: Jane Doe, 555-1234&#10;Other vehicle at scene: White Toyota, plate ABC-123"
              onChange={(e) => setDocData({...docData, witnesses: e.target.value})}
              value={docData.witnesses || ''}
            />
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
            <textarea
              className="w-full bg-slate-900 border-2 border-slate-700 rounded px-4 py-2 h-32"
              placeholder="Weather conditions, lighting, officer demeanor, anything else relevant"
              onChange={(e) => setDocData({...docData, notes: e.target.value})}
              value={docData.notes || ''}
            />
          </div>

          <div className="bg-blue-900/20 border-2 border-blue-500 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-400" />
              Next Steps: Kentucky Open Records Request
            </h2>
            <div className="text-slate-300 space-y-2">
              <p>File request with agency within days for:</p>
              <ul className="list-disc list-inside ml-4">
                <li>All dash cam footage</li>
                <li>All body cam footage</li>
                <li>Officer reports</li>
                <li>Radio communications</li>
              </ul>
              <p className="mt-4">Agency must respond within 5 business days (up to 20 in exceptional circumstances).</p>
              <p>Send to: Agency's official custodian of records (usually administrative office).</p>
            </div>
          </div>

          <button
            onClick={() => {
              const text = `TRAFFIC STOP DOCUMENTATION

Date/Time: ${docData.datetime || '[Not provided]'}
Location: ${docData.location || '[Not provided]'}

OFFICER INFORMATION:
${docData.officers || '[Not provided]'}
Patrol Car: ${docData.vehicles || '[Not provided]'}
Agency: ${docData.agency || '[Not provided]'}

RECORDING EQUIPMENT:
Dash cam: ${docData.dashcam ? 'Yes' : 'No'}
Body cam: ${docData.bodycam ? 'Yes' : 'No'}
I recorded: ${docData.myrecording ? 'Yes' : 'No'}

TIMELINE:
${docData.timeline || '[Not provided]'}

DIALOGUE:
${docData.dialogue || '[Not provided]'}

SEARCH:
Vehicle searched: ${docData.searched ? 'Yes' : 'No'}
I consented: ${docData.consented ? 'Yes' : 'No'}
Items removed: ${docData.itemsRemoved || '[None]'}
Damage: ${docData.damage || '[None]'}
K-9 used: ${docData.k9 ? 'Yes' : 'No'}

WITNESSES:
${docData.witnesses || '[None]'}

ADDITIONAL NOTES:
${docData.notes || '[None]'}`;

              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `traffic-stop-${new Date().toISOString().split('T')[0]}.txt`;
              a.click();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg"
          >
            Download Documentation
          </button>

          <button
            onClick={handleClearDocumentation}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg"
          >
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );

  if (mode === 'home') return renderHome();
  if (mode === 'learn') return renderLearn();
  if (mode === 'practice') return renderPractice();
  if (mode === 'document') return renderDocument();
}
