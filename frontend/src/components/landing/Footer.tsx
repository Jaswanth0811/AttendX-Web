'use client';

import Link from 'next/link';
import { QrCode, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  const portalLinks = [
    { label: 'Admin Login', href: '/admin/login' },
    { label: 'Faculty Login', href: '/faculty/login' },
    { label: 'Student Login', href: '/student/login' },
  ];

  return (
    <footer className="relative bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AttendX</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Smart QR-Based Attendance Management System built for modern colleges and universities. Streamline attendance tracking with secure, real-time solutions.
            </p>
            {/* Social Icons placeholder */}
            <div className="flex gap-3">
              {['twitter', 'linkedin', 'github'].map((social) => (
                <button
                  key={social}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-indigo-500/20 flex items-center justify-center text-gray-400 hover:text-indigo-400 transition-colors"
                  aria-label={social}
                >
                  <div className="w-4 h-4 rounded-sm bg-current opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Portals</h3>
            <ul className="space-y-3">
              {portalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                support@attendx.edu
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                University Campus, Tech City, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AttendX. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
