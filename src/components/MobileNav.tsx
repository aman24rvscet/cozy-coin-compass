
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, BarChart3, Settings, BookOpen, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavProps {
  user: any;
}

const MobileNav: React.FC<MobileNavProps> = ({ user }) => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  const closeSheet = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col space-y-4 mt-8">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium">Welcome back,</p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.full_name || user?.email}
            </p>
          </div>
          
          <Link 
            to="/how-to-use" 
            className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
            onClick={closeSheet}
          >
            <BookOpen className="w-4 h-4 mr-3" />
            How to Use
          </Link>
          
          <Link 
            to="/analytics" 
            className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
            onClick={closeSheet}
          >
            <BarChart3 className="w-4 h-4 mr-3" />
            Analytics
          </Link>
          
          <Link 
            to="/contact" 
            className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
            onClick={closeSheet}
          >
            <Phone className="w-4 h-4 mr-3" />
            Contact Us
          </Link>
          
          <Link 
            to="/settings" 
            className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
            onClick={closeSheet}
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Link>
          
          <button
            onClick={() => {
              logout();
              closeSheet();
            }}
            className="flex items-center px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors text-left w-full"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
