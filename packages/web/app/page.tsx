'use client';

import { Brain, Scale, TrendingUp, Users, Zap, Trophy, Calendar, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-locker-texture opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="p-6 bg-locker-gradient rounded-full shadow-2xl">
              <Brain className="h-16 w-16 text-white" />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl font-bold bg-locker-gradient bg-clip-text text-transparent mb-8"
          >
            LockerRoom AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl text-gray-600 mb-6"
          >
            The Ultimate Fantasy Football Platform
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-500 max-w-4xl mx-auto mb-12"
          >
            AI-powered assistants, advanced commissioner tools, real-time scoring, and intelligent features 
            that go beyond traditional fantasy football. Built for the modern fantasy manager.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 mb-16"
          >
            <Link href="/ai/start-sit-coach">
              <Button className="locker-button text-lg px-8 py-4">
                <Brain className="h-5 w-5 mr-2" />
                Try AI Coach
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="text-lg px-8 py-4 border-2 hover:bg-gray-50">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 px-6 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">🤖 AI-Powered Assistants</h2>
            <p className="text-2xl text-gray-600">
              Our core differentiators that set us apart from Sleeper, ESPN, and Yahoo
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Start/Sit Coach",
                description: "Personalized recommendations based on matchups, weather, trends, and game scripts. No betting factors.",
                href: "/ai/start-sit-coach",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100"
              },
              {
                icon: Scale,
                title: "AI Trade Evaluator", 
                description: "Fairness index, veto risk analysis, and market evaluation to ensure balanced trades.",
                href: "/ai/trade-evaluator",
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100"
              },
              {
                icon: Trophy,
                title: "Live Draft Board",
                description: "Real-time draft assistance with AI copilot, exposure tracking, and value insights.",
                href: "/draft/live",
                color: "from-green-500 to-green-600",
                bgColor: "from-green-50 to-green-100"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Link href={feature.href}>
                  <Card className="immersive-card h-full">
                    <CardHeader className={`bg-gradient-to-r ${feature.bgColor} group-hover:from-opacity-80 group-hover:to-opacity-80 transition-all duration-300`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
                        <span>Try it now</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6">🏆 Advanced Features</h2>
            <p className="text-2xl text-gray-600">
              Everything you need for the ultimate fantasy football experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-semibold mb-6 flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-blue-600" />
                League Types
              </h3>
              <ul className="space-y-3 text-lg text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  Redraft, Dynasty, Keeper, Best-Ball
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  Vampire, Guillotine, Survivor, Playoff-only
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  Superflex, IDP, Devy, Taxi squad
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  Custom scoring events & roster rules
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-semibold mb-6 flex items-center">
                <Settings className="h-8 w-8 mr-3 text-purple-600" />
                Commissioner Tools
              </h3>
              <ul className="space-y-3 text-lg text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  Ultra-flex rule builder
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  Escrow & payout wallet
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  ML collusion detection
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 text-success-500" />
                  Full audit logs & undo stack
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-locker-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-locker-texture opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-8"
          >
            Ready to Experience the Future?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl mb-12 opacity-90"
          >
            Join the next generation of fantasy football with AI-powered insights and advanced tools.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Link href="/ai/start-sit-coach">
              <Button className="bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-xl">
                <Brain className="h-5 w-5 mr-2" />
                Try AI Features
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}