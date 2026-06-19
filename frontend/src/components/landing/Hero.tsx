'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, Shield, GraduationCap, Users } from 'lucide-react';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/10 dark:bg-teal-500/5 rounded-full blur-3xl" />

      <div ref={heroRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  Trusted by 50+ Colleges
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  Testing & Under Construction Mode
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
              Smart{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite]">
                Code-Based
              </span>{' '}
              Attendance for Colleges
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Revolutionize attendance tracking with secure rotating codes, real-time monitoring, and comprehensive analytics. Built for modern educational institutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/admin/login"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
              >
                <Shield className="w-5 h-5" />
                Admin Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/faculty/login"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all hover:-translate-y-0.5"
              >
                <Users className="w-5 h-5" />
                Faculty Login
              </a>
              <a
                href="/student/login"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all hover:-translate-y-0.5"
              >
                <GraduationCap className="w-5 h-5" />
                Student Login
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Secure & Encrypted
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Real-time Updates
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Easy Integration
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl blur-3xl opacity-20 dark:opacity-10 scale-95" />
              
              {/* Main Image */}
              <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-2xl shadow-indigo-500/10">
                <Image
                  src="/hero-illustration.png"
                  alt="AttendX QR Attendance System"
                  width={500}
                  height={500}
                  className="w-full h-auto rounded-2xl"
                  priority
                />
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 p-4 border border-gray-100 dark:border-gray-700 animate-[float_4s_ease-in-out_infinite]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Attendance</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Marked ✓</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-black/5 p-4 border border-gray-100 dark:border-gray-700 animate-[float_4s_ease-in-out_infinite_1s]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">87%</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Overall</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Attendance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
