// ============================================
// MAIN LAYOUT WITH NAVBAR
// ============================================

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Send, 
  FileText, 
  ShoppingCart,
  AlertTriangle,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Factory,
  Store,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationsContainer, Dropdown, DropdownItem } from '../components/UI';

const MainLayout = ({ children }) => {
  const { 
    currentRole, 
    currentPartnerId, 
    partners, 
    switchRole, 
    logout, 
    notifications, 
    removeNotification,
    dispatchRequests,
    damageReports,
    ROLES 
  } = useApp();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  // Get current partner if in partner view
  const currentPartner = currentPartnerId 
    ? partners.find(p => p.id === currentPartnerId) 
    : null;
  
  // Count pending items for notification badge
  const pendingRequests = dispatchRequests.filter(d => d.status === 'pending').length;
  const pendingDamages = damageReports.filter(d => d.status === 'pending').length;
  const totalPending = pendingRequests + pendingDamages;
  
  // Navigation items based on role
  const getNavItems = () => {
    if (currentRole === ROLES.ADMIN || currentRole === ROLES.MANUFACTURER) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/products', label: 'Products', icon: Package },
        { path: '/partners', label: 'Partners', icon: Users },
        { path: '/inventory', label: 'Inventory', icon: Factory },
        { path: '/dispatch', label: 'Dispatch', icon: Send, badge: pendingRequests },
        { path: '/damages', label: 'Damages', icon: AlertTriangle, badge: pendingDamages },
        { path: '/reports', label: 'Reports', icon: FileText },
      ];
    } else {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/my-stock', label: 'My Stock', icon: Package },
        { path: '/record-sale', label: 'Record Sale', icon: ShoppingCart },
        { path: '/my-requests', label: 'My Requests', icon: Send },
        { path: '/report-damage', label: 'Report Damage', icon: AlertTriangle },
      ];
    }
  };
  
  const navItems = getNavItems();
  
  // Role display info
  const getRoleInfo = () => {
    switch (currentRole) {
      case ROLES.ADMIN:
        return { label: 'Admin', icon: Shield, color: 'text-amber-400' };
      case ROLES.MANUFACTURER:
        return { label: 'Manufacturer', icon: Factory, color: 'text-emerald-400' };
      case ROLES.PARTNER:
        return { label: currentPartner?.name || 'Partner', icon: Store, color: 'text-blue-400' };
      default:
        return { label: 'User', icon: User, color: 'text-cream' };
    }
  };
  
  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;
  
  const handleRoleSwitch = (role, partnerId = null) => {
    switchRole(role, partnerId);
    navigate('/dashboard');
    setMobileMenuOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-charcoal">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-black border-b border-olive/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-olive rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-cream" />
              </div>
              <span className="text-xl font-display font-bold text-cream hidden sm:block">
                Inventory Pro
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-olive text-cream' 
                        : 'text-cream/70 hover:text-cream hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-burgundy text-cream text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Right side: Notifications + Role Switcher */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              {(currentRole === ROLES.ADMIN || currentRole === ROLES.MANUFACTURER) && totalPending > 0 && (
                <button className="relative p-2 text-cream/70 hover:text-cream transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-burgundy text-cream text-xs font-bold rounded-full flex items-center justify-center">
                    {totalPending}
                  </span>
                </button>
              )}
              
              {/* Role Switcher Dropdown */}
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <RoleIcon className={`w-4 h-4 ${roleInfo.color}`} />
                    <span className="text-sm font-medium text-cream hidden sm:block">
                      {roleInfo.label}
                    </span>
                    <ChevronDown className="w-4 h-4 text-cream/50" />
                  </button>
                }
              >
                <div className="px-4 py-2 border-b border-olive/10">
                  <p className="text-xs text-olive uppercase tracking-wide">Switch Role</p>
                </div>
                
                <DropdownItem 
                  icon={Shield} 
                  onClick={() => handleRoleSwitch(ROLES.ADMIN)}
                >
                  Admin (Full Control)
                </DropdownItem>
                
                <DropdownItem 
                  icon={Factory} 
                  onClick={() => handleRoleSwitch(ROLES.MANUFACTURER)}
                >
                  Manufacturer
                </DropdownItem>
                
                <div className="px-4 py-2 border-t border-olive/10">
                  <p className="text-xs text-olive uppercase tracking-wide">Partners</p>
                </div>
                
                {partners.filter(p => p.status === 'active').map(partner => (
                  <DropdownItem 
                    key={partner.id}
                    icon={Store} 
                    onClick={() => handleRoleSwitch(ROLES.PARTNER, partner.id)}
                  >
                    {partner.name}
                  </DropdownItem>
                ))}
                
                <div className="border-t border-olive/10 mt-2 pt-2">
                  <DropdownItem icon={LogOut} onClick={handleLogout} danger>
                    Logout
                  </DropdownItem>
                </div>
              </Dropdown>
              
              {/* Mobile menu button */}
              <button 
                className="lg:hidden p-2 text-cream/70 hover:text-cream"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-olive/20 bg-black/95 backdrop-blur-sm animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-olive text-cream' 
                        : 'text-cream/70 hover:text-cream hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="ml-auto w-6 h-6 bg-burgundy text-cream text-sm font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
      
      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* NOTIFICATIONS */}
      <NotificationsContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </div>
  );
};

export default MainLayout;
