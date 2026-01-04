import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  LayoutTemplate,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/templates', label: 'Templates', icon: LayoutTemplate },
  { path: '/agents', label: 'My Agents', icon: Bot },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { profile, signOut } = useAuth();

  const displayName = profile?.full_name || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const role = profile?.role || 'AI Consultant';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">X</span>
            </div>
            <span className="font-bold text-lg text-foreground">Voice AI Studio</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/dashboard' && location.pathname === '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'nav-item',
                isActive && 'active',
                sidebarCollapsed && 'justify-center px-0'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        {!sidebarCollapsed ? (
          <div className="glass-card p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{role}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            'w-full mt-3 text-muted-foreground hover:text-foreground',
            sidebarCollapsed && 'px-0 justify-center'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </motion.aside>
  );
};
