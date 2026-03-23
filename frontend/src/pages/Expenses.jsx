import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Receipt } from 'lucide-react';

export const Expenses = () => {
  return (
    <DashboardLayout>
      <div data-testid="expenses-page">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading tracking-tight text-slate-900 mb-2">
            Expense Management
          </h1>
          <p className="text-slate-600">
            Track and manage employee expenses
          </p>
        </div>

        <Card className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <Receipt className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">
            Coming in Phase 2
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Expense management features including submission, receipt uploads, and approval tracking will be available in the next phase.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
};