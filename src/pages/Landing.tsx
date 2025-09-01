
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { Calendar, Clock, Cog, CreditCard, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#about">About</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#contact">Contact</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex items-center bg-gradient-to-b from-cyan-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                Banquet Management <span className="text-cyan-600">Simplified</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Streamlined solutions for banquet venues and event professionals. 
                Manage bookings, staff, inventory, and more with our all-in-one system.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login-admin" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">
                    Login as Admin
                  </Button>
                </Link>
                <Link to="/login-staff" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    Login as Staff
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute top-0 -left-8 w-72 h-72 bg-cyan-300 rounded-full opacity-50 filter blur-3xl"></div>
                <div className="absolute bottom-0 -right-8 w-72 h-72 bg-cyan-500 rounded-full opacity-30 filter blur-3xl"></div>
                
                <div className="relative bg-white rounded-xl shadow-xl p-6 z-10 animate-fade-in">
                  <div className="flex items-center mb-4">
                    <div className="h-2 w-2 rounded-full bg-red-400 mr-1"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-400 mr-1"></div>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                  
                  <div className="border-b pb-3 mb-3">
                    <h3 className="font-semibold text-lg text-cyan-700">Daily Events</h3>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="p-3 bg-cyan-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Smith Wedding</h4>
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Ongoing</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Grand Hall • 150 guests</div>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock size={12} className="mr-1" /> 14:00 - 22:00
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Johnson Anniversary</h4>
                        <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">Setup</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Garden Terrace • 75 guests</div>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock size={12} className="mr-1" /> 18:00 - 23:00
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comprehensive Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-cyan-100 text-cyan-600 flex items-center justify-center rounded-full">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Booking Management</h3>
              <p className="text-gray-600">Streamlined calendar interface with conflict prevention and recurring events.</p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-cyan-100 text-cyan-600 flex items-center justify-center rounded-full">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Client CRM</h3>
              <p className="text-gray-600">Track client details, preferences, event history, and communication logs.</p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-cyan-100 text-cyan-600 flex items-center justify-center rounded-full">
                <CreditCard size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Billing & Payments</h3>
              <p className="text-gray-600">Manage quotations, invoices, payments, taxes, and discounts effortlessly.</p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-cyan-100 text-cyan-600 flex items-center justify-center rounded-full">
                <Cog size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Resource Management</h3>
              <p className="text-gray-600">Track inventory, staff assignments, catering, and venue availability.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo size="md" className="text-white" />
              <p className="mt-2 text-sm">Banquet Management Solutions</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm">
            &copy; 2025 BanquetMS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
