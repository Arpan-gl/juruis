import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, User, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface store {
    isLogin: boolean;
}

const Header = () => {
  const isLogin = useSelector((state: store) => state.isLogin);
  const [user, setUser] = useState<any>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Fetch user profile when logged in
  useEffect(() => {
    if (isLogin) {
      fetchUserProfile();
    }
  }, [isLogin]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/getUserDetail', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Group navigation items for dropdown menus
  const mainNavItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'Services', 
      id: 'services',
      isDropdown: true,
      children: [
        { name: 'Contract Analyzer', path: '/contract-analyzer' },
        { name: 'AI Lawyer', path: '/ai-lawyer' },
        { name: 'Contract Comparison', path: '/contract-comparison' },
        { name: 'Legal Community', path: '/legal-community' },
      ]
    },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
  ];

  const accountNavItems = !isLogin ? [
    { name: 'Sign In', path: '/signIn' },
  ] : [
    {name:"Sign Out",path: "/signOut"}
  ];

  // Dropdown component for the desktop navigation
  const DesktopDropdown = ({ item }) => {
    const handleDropdownToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveDropdown(activeDropdown === item.id ? null : item.id);
    };
    
    const isOpen = activeDropdown === item.id;
    
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          className="flex items-center text-sm font-medium text-gray-700 hover:text-juris-primary transition-colors dark:text-gray-200 dark:hover:text-juris-secondary"
          onClick={handleDropdownToggle}
        >
          {item.name}
          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            {item.children.map((child) => (
              <Link
                key={child.name}
                to={child.path}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Mobile dropdown component
  const MobileDropdown = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleDropdown = (e) => {
      e.preventDefault();
      setIsOpen(!isOpen);
    };
    
    return (
      <div>
        <button 
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-juris-primary transition-colors dark:text-gray-200 dark:hover:text-juris-secondary px-3 py-2"
          onClick={toggleDropdown}
        >
          {item.name}
          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="pl-4 space-y-1 mt-1">
            {item.children.map((child) => (
              <Link
                key={child.name}
                to={child.path}
                className="block px-3 py-2 text-sm text-gray-600 hover:text-juris-primary dark:text-gray-300 dark:hover:text-juris-secondary"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-30 w-full border-b transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm dark:bg-black/95' : 'bg-white dark:bg-black'
    } dark:border-gray-800`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-juris-primary to-juris-accent bg-clip-text text-transparent">JurisAI</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {mainNavItems.map((item) => (
              item.isDropdown ? (
                <DesktopDropdown key={item.name} item={item} />
              ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-juris-primary dark:text-juris-secondary'
                      : 'text-gray-700 hover:text-juris-primary dark:text-gray-200 dark:hover:text-juris-secondary'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            <div className="h-4 border-l border-gray-300 dark:border-gray-700"></div>
            
            {isLogin && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {user.role && (
                        <Badge variant="outline" className="w-fit">
                          {user.role === 'lawyer' ? 'Lawyer' : user.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/legal-community">
                      <User className="mr-2 h-4 w-4" />
                      Legal Community
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/lawyer-verification">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Lawyer Verification
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/signout">
                      Sign Out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              accountNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm font-medium text-gray-700 hover:text-juris-primary transition-colors dark:text-gray-200 dark:hover:text-juris-secondary"
                >
                  {item.name}
                </Link>
              ))
            )}
            
            <Button size="sm" className="bg-juris-primary hover:bg-juris-primary/90 text-white" asChild>
              <Link to="/ai-lawyer">Get Started</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-200 hover:text-juris-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-fade-down animate-duration-200">
            <div className="flex flex-col space-y-1">
              {mainNavItems.map((item) => (
                item.isDropdown ? (
                  <MobileDropdown key={item.name} item={item} />
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-sm font-medium px-3 py-2 rounded-md ${
                      location.pathname === item.path
                        ? 'text-juris-primary bg-gray-50 dark:text-juris-secondary dark:bg-gray-900'
                        : 'text-gray-700 hover:text-juris-primary hover:bg-gray-50 dark:text-gray-200 dark:hover:text-juris-secondary dark:hover:bg-gray-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>
              
              {isLogin && user ? (
                <>
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt={user.username} />
                        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        {user.role && (
                          <Badge variant="outline" className="text-xs">
                            {user.role === 'lawyer' ? 'Lawyer' : user.role === 'admin' ? 'Admin' : 'User'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to="/legal-community"
                    className="text-sm font-medium text-gray-700 hover:text-juris-primary hover:bg-gray-50 transition-colors block px-3 py-2 rounded-md dark:text-gray-200 dark:hover:text-juris-secondary dark:hover:bg-gray-900"
                  >
                    Legal Community
                  </Link>
                  
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/lawyer-verification"
                      className="text-sm font-medium text-gray-700 hover:text-juris-primary hover:bg-gray-50 transition-colors block px-3 py-2 rounded-md dark:text-gray-200 dark:hover:text-juris-secondary dark:hover:bg-gray-900"
                    >
                      Lawyer Verification
                    </Link>
                  )}
                  
                  <Link
                    to="/signout"
                    className="text-sm font-medium text-gray-700 hover:text-juris-primary hover:bg-gray-50 transition-colors block px-3 py-2 rounded-md dark:text-gray-200 dark:hover:text-juris-secondary dark:hover:bg-gray-900"
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                accountNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-sm font-medium text-gray-700 hover:text-juris-primary hover:bg-gray-50 transition-colors block px-3 py-2 rounded-md dark:text-gray-200 dark:hover:text-juris-secondary dark:hover:bg-gray-900"
                  >
                    {item.name}
                  </Link>
                ))
              )}
              
              <div className="pt-2">
                <Button size="sm" className="w-full bg-juris-primary hover:bg-juris-primary/90" asChild>
                  <Link to="/ai-lawyer">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;