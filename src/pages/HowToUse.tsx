
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  PlusCircle, 
  BarChart3, 
  Calendar, 
  Wallet, 
  Target,
  TrendingUp,
  Settings,
  PieChart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import Footer from '@/components/Footer';

const HowToUse: React.FC = () => {
  const features = [
    {
      icon: PlusCircle,
      title: "Add Expenses",
      description: "Track your daily expenses with custom categories, descriptions, and dates.",
      steps: [
        "Click the 'Add Expense' button on your dashboard",
        "Enter the amount you spent",
        "Select or create a category",
        "Choose the date when the expense occurred",
        "Add a description (optional)",
        "Save your expense"
      ],
      image: "photo-1649972904349-6e44c42644a7"
    },
    {
      icon: Wallet,
      title: "Manage Income Sources",
      description: "Add your salary and additional income sources to track your financial health.",
      steps: [
        "Navigate to the Income & Budget section",
        "Click 'Add Income Source'",
        "Choose between Salary or Additional Income",
        "Enter your income amount",
        "Select frequency (Monthly, Weekly, One-time)",
        "Add a description and save"
      ],
      image: "photo-1488590528505-98d2b5aba04b"
    },
    {
      icon: Target,
      title: "Set Budgets",
      description: "Create budgets for different categories to control your spending.",
      steps: [
        "Go to the Budget Manager section",
        "Click 'Add Budget'",
        "Select a category to budget for",
        "Set your budget amount",
        "Choose the budget period",
        "Monitor your progress"
      ],
      image: "photo-1461749280684-dccba630e2f6"
    },
    {
      icon: BarChart3,
      title: "View Analytics",
      description: "Get insights into your spending patterns with detailed charts and reports.",
      steps: [
        "Click on 'Analytics' in the navigation",
        "View your expense trends over time",
        "Analyze spending by category",
        "Check your salary utilization",
        "Review monthly comparisons",
        "Export reports if needed"
      ],
      image: "photo-1581091226825-a6a2a5aee158"
    },
    {
      icon: Settings,
      title: "Customize Settings",
      description: "Personalize your experience with currency settings and profile management.",
      steps: [
        "Navigate to Settings page",
        "Update your profile information",
        "Change your preferred currency",
        "Manage expense categories",
        "Customize notification preferences",
        "Save your changes"
      ],
      image: "photo-1531297484001-80022131f5a1"
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Track Financial Health",
      description: "Monitor your salary utilization and see how much money you have left each month."
    },
    {
      icon: PieChart,
      title: "Visual Insights",
      description: "Understand your spending patterns with interactive charts and graphs."
    },
    {
      icon: Calendar,
      title: "Historical Data",
      description: "View your expense history and track your financial progress over time."
    },
    {
      icon: CheckCircle,
      title: "Budget Control",
      description: "Stay within your limits with category-wise budget tracking and alerts."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/below.png" alt="Below Budget" className="w-40 h-12 bg-transparent" />
            </Link>
            <Link to="/">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How to Use Below Budget</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master your finances with our comprehensive expense tracking platform. 
            Learn how to use all features to take control of your financial health.
          </p>
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quick Start Guide</CardTitle>
            <CardDescription>
              Get started in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Add Your Income</h3>
                <p className="text-sm text-muted-foreground">
                  Start by adding your salary and any additional income sources
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Track Expenses</h3>
                <p className="text-sm text-muted-foreground">
                  Log your daily expenses with categories and descriptions
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Analyze & Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Review your spending patterns and set budgets for better control
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Detailed Feature Guide</h2>
          <div className="space-y-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}>
                  <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/10 rounded-lg p-3">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">{feature.description}</p>
                    <div className="space-y-3">
                      {feature.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-3">
                          <div className="bg-primary/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium">{stepIndex + 1}</span>
                          </div>
                          <p className="text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                    <div className="bg-muted rounded-lg p-8 aspect-video flex items-center justify-center">
                      <img 
                        src={`https://images.unsplash.com/${feature.image}?w=600&h=400&fit=crop`}
                        alt={feature.title}
                        className="rounded-lg shadow-lg max-w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why Use Below Budget?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card key={benefit.title} className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Pro Tips for Better Financial Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Regular Updates</h4>
                    <p className="text-sm text-muted-foreground">Log expenses daily for accurate tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Use Categories</h4>
                    <p className="text-sm text-muted-foreground">Organize expenses with meaningful categories</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Set Realistic Budgets</h4>
                    <p className="text-sm text-muted-foreground">Create achievable budget goals based on your history</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Review Analytics</h4>
                    <p className="text-sm text-muted-foreground">Check your spending patterns monthly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Multiple Income Sources</h4>
                    <p className="text-sm text-muted-foreground">Track all income for complete financial picture</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Monitor Salary Usage</h4>
                    <p className="text-sm text-muted-foreground">Keep track of how much of your salary you're using</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
          <p className="text-muted-foreground mb-6">
            Start your financial journey today with Below Budget
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2">
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowToUse;
