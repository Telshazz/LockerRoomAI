'use client';

import { Brain, Scale, TrendingUp, Users, Zap, Trophy, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            LockerRoom AI
          </h1>
          
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4">
            The Ultimate Fantasy Football Platform
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-12">
            AI-powered assistants, advanced commissioner tools, real-time scoring, and intelligent features 
            that go beyond traditional fantasy football. Built for the modern fantasy manager.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link href="/ai/start-sit-coach" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              Try AI Coach
            </Link>
            <Link href="/dashboard" className="border border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-6 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🤖 AI-Powered Assistants</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Our core differentiators that set us apart from Sleeper, ESPN, and Yahoo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <Brain className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold">AI Start/Sit Coach</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Personalized recommendations based on matchups, weather, trends, and game scripts. No betting factors.
              </p>
              <Link href="/ai/start-sit-coach" className="text-blue-600 hover:text-blue-700 font-medium">
                Try it now →
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <Scale className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold">AI Trade Evaluator</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Fairness index, veto risk analysis, and market evaluation to ensure balanced trades.
              </p>
              <Link href="/ai/trade-evaluator" className="text-purple-600 hover:text-purple-700 font-medium">
                Analyze trades →
              </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold">Draft Copilot</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Real-time draft assistance with exposure tracking and value-over-replacement insights.
              </p>
              <span className="text-green-600 font-medium">Coming soon</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <Zap className="h-8 w-8 text-yellow-600 mr-3" />
                <h3 className="text-xl font-semibold">Waiver Optimizer</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Personalized FAAB recommendations and waiver wire analysis for your roster.
              </p>
              <span className="text-yellow-600 font-medium">Coming soon</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-xl font-semibold">Locker Room Chatbot</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Powered by Grok for league chat, trash talk, and loser task reminders.
              </p>
              <span className="text-red-600 font-medium">Coming soon</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center mb-4">
                <Trophy className="h-8 w-8 text-indigo-600 mr-3" />
                <h3 className="text-xl font-semibold">Voice Recap</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Weekly podcast-style summaries with ElevenLabs voice technology.
              </p>
              <span className="text-indigo-600 font-medium">Coming soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🏆 Advanced Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need for the ultimate fantasy football experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                League Types
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>• Redraft, Dynasty, Keeper, Best-Ball</li>
                <li>• Vampire, Guillotine, Survivor, Playoff-only</li>
                <li>• Superflex, IDP, Devy, Taxi squad</li>
                <li>• Custom scoring events & roster rules</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-purple-600" />
                Commissioner Tools
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>• Ultra-flex rule builder</li>
                <li>• Escrow & payout wallet</li>
                <li>• ML collusion detection</li>
                <li>• Full audit logs & undo stack</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience the Future?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the next generation of fantasy football with AI-powered insights and advanced tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/ai/start-sit-coach" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Try AI Features
            </Link>
            <Link href="/dashboard" className="border border-white/30 hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              View Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 