import { Link } from 'react-router-dom';
import { Building2, Users, Bell, Shield } from 'lucide-react';

const features = [
  { icon: Building2, title: 'Manage Properties', desc: 'Add and organize all your rental houses in one place. Track occupancy and rent amounts easily.' },
  { icon: Users, title: 'Tenant Management', desc: 'Add tenants to houses, set lease terms, track balances, and optionally give them portal access.' },
  { icon: Bell, title: 'Automated Reminders', desc: 'Tenants receive email reminders 3 days before rent is due — automatically, every month.' },
  { icon: Shield, title: 'Secure & Isolated', desc: 'Your data stays private. Each landlord only sees their own houses and tenants. Zero cross-tenant leaks.' },
];

const Landing = () => (
  <div className="min-h-screen bg-white">
    {/* Nav */}
    <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
      <span className="text-xl font-bold text-gray-900">RentalSaaS</span>
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Login</Link>
        <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
          Get Started
        </Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="text-center px-6 py-24 max-w-3xl mx-auto">
      <span className="inline-block text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
        Rental Management Platform
      </span>
      <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
        Manage your rentals,<br />
        <span className="text-blue-600">effortlessly.</span>
      </h1>
      <p className="text-xl text-gray-500 mb-10 leading-relaxed">
        A simple, secure platform for landlords to manage houses, tenants, and rent — with automated reminders built in.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link
          to="/register"
          className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
        >
          Start for free
        </Link>
        <Link
          to="/login"
          className="text-gray-700 border border-gray-200 px-8 py-3.5 rounded-xl font-semibold text-base hover:border-gray-400 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </section>

    {/* Features */}
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything you need to run your rentals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Icon size={20} className="text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="text-center py-20 px-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
      <p className="text-gray-500 mb-8">Create your landlord account in under a minute.</p>
      <Link
        to="/register"
        className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        Create free account
      </Link>
    </section>

    <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} RentalSaaS. All rights reserved.
    </footer>
  </div>
);

export default Landing;
