'use client';

import { useEffect, useRef } from 'react';
import { ShieldCheck, Building, Users, GraduationCap, Zap, Clock, TrendingUp, Lock } from 'lucide-react';

const benefits = [
  {
    icon: <Zap className="w-6 h-6 text-amber-500" />,
    title: 'Why QR Attendance?',
    description: 'Traditional manual attendance is slow, error-prone, and easy to manipulate. QR-based attendance eliminates proxy attendance, reduces class disruption, and provides instant digital records that are tamper-proof.',
    iconBg: 'bg-amber-50 dark:bg-amber-500/10',
  },
  {
    icon: <Building className="w-6 h-6 text-indigo-500" />,
    title: 'Benefits for Colleges',
    description: 'Get real-time institution-wide attendance analytics. Identify low-attendance departments, track faculty effectiveness, generate compliance reports instantly, and reduce administrative overhead by 70%.',
    iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
  },
  {
    icon: <Users className="w-6 h-6 text-purple-500" />,
    title: 'Benefits for Faculty',
    description: 'Start attendance in one click — no more calling out names. Get a live count of present students, manage corrections before finalizing, and access subject-wise reports for any date range.',
    iconBg: 'bg-purple-50 dark:bg-purple-500/10',
  },
  {
    icon: <GraduationCap className="w-6 h-6 text-teal-500" />,
    title: 'Benefits for Students',
    description: 'Scan a QR code and you\'re marked present — takes less than 3 seconds. Track your attendance percentage per subject, receive alerts before it drops below the threshold, and plan ahead.',
    iconBg: 'bg-teal-50 dark:bg-teal-500/10',
  },
];

export default function About() {
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

  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="text-center mb-16 opacity-0 translate-y-8"
          style={{ transition: 'opacity 0.6s ease-out, transform 0.6s ease-out' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 mb-4">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Why AttendX</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Built for{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Modern Education
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            See how QR-based attendance transforms the experience for every stakeholder in your institution.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={benefit.title} {...benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ icon, title, description, iconBg, index }: { icon: React.ReactNode; title: string; description: string; iconBg: string; index: number }) {
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
          }, index * 100);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className="flex gap-5 p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 opacity-0 translate-y-8"
      style={{ transition: 'opacity 0.6s ease-out, transform 0.6s ease-out, box-shadow 0.3s' }}
    >
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
