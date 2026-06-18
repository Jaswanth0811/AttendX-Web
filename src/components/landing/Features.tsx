'use client';

import { useEffect, useRef } from 'react';
import {
  Users, BookOpen, Calendar, BarChart3,
  QrCode, FileText, ArrowRightLeft,
  ScanLine, BookMarked, Clock, Bell
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  features: string[];
  gradient: string;
  iconBg: string;
  delay: number;
}

function FeatureCard({ icon, title, features, gradient, iconBg, delay }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="group relative bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:border-transparent hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-500 hover:-translate-y-2 opacity-0 translate-y-8"
      style={{ transition: 'opacity 0.6s ease-out, transform 0.6s ease-out, box-shadow 0.5s, border-color 0.5s' }}
    >
      {/* Gradient Border on Hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl scale-105`} />

      {/* Icon */}
      <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>

      {/* Features List */}
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Features() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const portals = [
    {
      icon: <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
      title: 'Admin Portal',
      features: [
        'Student & Faculty Management',
        'Department & Section Setup',
        'Timetable Management',
        'Faculty Subject Assignment',
        'Reports & Analytics Dashboard',
        'Substitution Approval Workflow',
      ],
      gradient: 'from-indigo-500/20 to-purple-500/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
    },
    {
      icon: <QrCode className="w-7 h-7 text-purple-600 dark:text-purple-400" />,
      title: 'Faculty Portal',
      features: [
        'Secure QR Code Generation',
        'Auto-refreshing QR (30s expiry)',
        'Live Attendance Monitor',
        'Attendance Correction Tools',
        'Class Substitution Requests',
        'Subject & Section Reports',
      ],
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconBg: 'bg-purple-100 dark:bg-purple-500/20',
    },
    {
      icon: <ScanLine className="w-7 h-7 text-teal-600 dark:text-teal-400" />,
      title: 'Student Portal',
      features: [
        'Quick QR Scan Attendance',
        'Subject-wise Attendance View',
        'Attendance History & Trends',
        'Low Attendance Alerts',
        'Overall Performance Dashboard',
        'Real-time Confirmation',
      ],
      gradient: 'from-teal-500/20 to-emerald-500/20',
      iconBg: 'bg-teal-100 dark:bg-teal-500/20',
    },
  ];

  return (
    <section id="features" className="relative py-24 lg:py-32 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="text-center mb-16 opacity-0 translate-y-8"
          style={{ transition: 'opacity 0.6s ease-out, transform 0.6s ease-out' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-4">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Manage{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Attendance
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Three powerful portals designed for every stakeholder in your institution&apos;s attendance workflow.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portals.map((portal, index) => (
            <FeatureCard key={portal.title} {...portal} delay={index * 150} />
          ))}
        </div>
      </div>
    </section>
  );
}
