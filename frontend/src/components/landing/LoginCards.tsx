'use client';

import { useEffect, useRef } from 'react';
import { Shield, Users, GraduationCap, ArrowRight, LogIn } from 'lucide-react';

export default function LoginCards() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
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

  const loginOptions = [
    {
      title: 'Admin Login',
      description: 'Manage departments, faculty, students, timetables, and view institution-wide analytics.',
      href: '/admin/login',
      icon: <Shield className="w-8 h-8" />,
      gradient: 'from-indigo-500 to-blue-600',
      hoverGradient: 'group-hover:from-indigo-600 group-hover:to-blue-700',
      iconBg: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      borderColor: 'hover:border-indigo-300 dark:hover:border-indigo-500/40',
    },
    {
      title: 'Faculty Login',
      description: 'Conduct QR-based attendance, manage classes, request substitutions, and generate reports.',
      href: '/faculty/login',
      icon: <Users className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'group-hover:from-purple-600 group-hover:to-pink-700',
      iconBg: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
      borderColor: 'hover:border-purple-300 dark:hover:border-purple-500/40',
    },
    {
      title: 'Student Login',
      description: 'Scan QR codes, view attendance history, track subject-wise percentages, and get alerts.',
      href: '/student/login',
      icon: <GraduationCap className="w-8 h-8" />,
      gradient: 'from-teal-500 to-emerald-600',
      hoverGradient: 'group-hover:from-teal-600 group-hover:to-emerald-700',
      iconBg: 'bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400',
      borderColor: 'hover:border-teal-300 dark:hover:border-teal-500/40',
    },
  ];

  return (
    <section id="login" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-4">
            <LogIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Access Portal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Portal
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Select your role to access the appropriate dashboard.
          </p>
        </div>

        {/* Login Cards */}
        <div
          ref={ref}
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto opacity-0 translate-y-8"
          style={{ transition: 'opacity 0.6s ease-out, transform 0.6s ease-out' }}
        >
          {loginOptions.map((option) => (
            <a
              key={option.title}
              href={option.href}
              className={`group relative bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 ${option.borderColor} p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30`}
            >
              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl ${option.iconBg} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {option.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{option.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                {option.description}
              </p>

              {/* Button */}
              <div className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r ${option.gradient} ${option.hoverGradient} rounded-xl shadow-lg transition-all`}>
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
