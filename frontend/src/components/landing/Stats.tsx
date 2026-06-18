'use client';

import { useEffect, useRef, useState } from 'react';
import { GraduationCap, Users, CalendarCheck, Building2 } from 'lucide-react';

interface CounterProps {
  icon: React.ReactNode;
  target: number;
  suffix: string;
  label: string;
}

function Counter({ icon, target, suffix, label }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();

          function animate(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-center group">
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
        {icon}
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-indigo-200 text-sm font-medium">{label}</div>
    </div>
  );
}

export default function Stats() {
  const stats = [
    { icon: <GraduationCap className="w-8 h-8 text-white" />, target: 50000, suffix: '+', label: 'Students Managed' },
    { icon: <Users className="w-8 h-8 text-white" />, target: 2500, suffix: '+', label: 'Faculty Members' },
    { icon: <CalendarCheck className="w-8 h-8 text-white" />, target: 1000000, suffix: '+', label: 'Attendance Sessions' },
    { icon: <Building2 className="w-8 h-8 text-white" />, target: 120, suffix: '+', label: 'Departments' },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      {/* Animated blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <Counter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
