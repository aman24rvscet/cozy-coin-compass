import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import ProfileEditor from '@/components/ProfileEditor';
import CategoryManager from '@/components/CategoryManager';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="py-4">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your preferences and account settings
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Go to Home"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ProfileEditor />
          </div>
          <div>
            <CategoryManager />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
