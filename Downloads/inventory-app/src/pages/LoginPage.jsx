// ============================================
// LOGIN / ROLE SELECTION PAGE
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Factory, Store, Package, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LoginPage = () => {
  const { login, partners, ROLES } = useApp();
  const navigate = useNavigate();
  
  const handleRoleSelect = (role, partnerId = null) => {
    login(role, partnerId);
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-charcoal flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-olive/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-burgundy/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      {/* Logo & Title */}
      <div className="relative text-center mb-12 animate-fade-in">
        <div className="w-20 h-20 bg-olive rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-card">
          <Package className="w-10 h-10 text-cream" />
        </div>
        <h1 className="text-5xl font-display font-bold text-cream mb-3">
          Inventory Pro
        </h1>
        <p className="text-xl text-olive">
          Manufacturer-Retailer Inventory Management
        </p>
      </div>
      
      {/* Role Selection */}
      <div className="relative w-full max-w-4xl">
        <h2 className="text-center text-cream/60 text-sm uppercase tracking-widest mb-6">
          Select your role to continue
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Admin Role */}
          <button
            onClick={() => handleRoleSelect(ROLES.ADMIN)}
            className="group relative bg-cream rounded-card p-6 text-left transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
              <Shield className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-black mb-2">
              Admin
            </h3>
            <p className="text-olive mb-4">
              Full control over products, pricing, partners, and all operations.
            </p>
            <div className="flex items-center text-olive group-hover:text-black transition-colors">
              <span className="text-sm font-medium">Continue as Admin</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          {/* Manufacturer Role */}
          <button
            onClick={() => handleRoleSelect(ROLES.MANUFACTURER)}
            className="group relative bg-cream rounded-card p-6 text-left transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <Factory className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-black mb-2">
              Manufacturer
            </h3>
            <p className="text-olive mb-4">
              Manage production, dispatch stock, view reports and partner activity.
            </p>
            <div className="flex items-center text-olive group-hover:text-black transition-colors">
              <span className="text-sm font-medium">Continue as Manufacturer</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
          
          {/* Partner Role */}
          <div 
            className="relative bg-cream rounded-card p-6 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <Store className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-black mb-2">
              Partner
            </h3>
            <p className="text-olive mb-4">
              Record sales, manage stock, request inventory, report damages.
            </p>
            
            {/* Partner selector */}
            <div className="space-y-2 mt-4 pt-4 border-t border-olive/10">
              <p className="text-xs text-olive uppercase tracking-wide mb-3">Select Store</p>
              {partners.filter(p => p.status === 'active').map((partner, index) => (
                <button
                  key={partner.id}
                  onClick={() => handleRoleSelect(ROLES.PARTNER, partner.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-olive/5 hover:bg-olive/10 transition-colors group"
                >
                  <span className="font-medium text-black">{partner.name}</span>
                  <ArrowRight className="w-4 h-4 text-olive group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <p className="relative text-olive/50 text-sm mt-12">
        Demo Mode — All data is stored locally
      </p>
    </div>
  );
};

export default LoginPage;
