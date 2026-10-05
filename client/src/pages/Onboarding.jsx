import React from 'react';
import { MessageSquareHeart } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector.jsx';
import LevelSelector from '../components/LevelSelector.jsx';
import ScenarioSelector from '../components/ScenarioSelector.jsx';

export default function Onboarding({ config, setConfig, onStart }) {
  const handleUpdate = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const canStart = config.targetLanguage && config.level && config.scenario;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-5 text-center gap-5 sm:gap-6">
        <div className="space-y-2 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
            <MessageSquareHeart className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome to LinguaBuddy</h2>
          <p className="text-slate-400">Practice a language with your patient AI partner.</p>
        </div>

        <div className="w-full max-w-md space-y-4 bg-slate-900/50 p-4 sm:p-5 rounded-2xl border border-slate-700">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">1. Choose a Language</span>
              <LanguageSelector
                value={config.targetLanguage}
                onChange={(val) => handleUpdate('targetLanguage', val)}
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">2. Choose Your Level</span>
              <LevelSelector
                value={config.level}
                onChange={(val) => handleUpdate('level', val)}
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">3. Choose a Scenario</span>
              <ScenarioSelector
                value={config.scenario}
                onChange={(val) => handleUpdate('scenario', val)}
              />
            </div>
          </div>

          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-900/20"
          >
            Start Practice
          </button>
        </div>
      </div>
    </div>
  );
}
