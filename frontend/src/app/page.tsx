import LandingNavbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Stats from '@/components/landing/Stats';
import About from '@/components/landing/About';
import Contact from '@/components/landing/Contact';
import LoginCards from '@/components/landing/LoginCards';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <LandingNavbar />
      <Hero />
      <Features />
      <Stats />
      <About />
      <Contact />
      <LoginCards />
      <Footer />
    </main>
  );
}
