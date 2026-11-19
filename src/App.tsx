import { useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { PaymentSection } from './components/PaymentSection';
import { PlansSection } from './components/PlansSection';
import { RulesSection } from './components/RulesSection';
import { SavingsSimulator } from './components/SavingsSimulator';
import { PlanId } from './data/membershipData';
import { usePlanConfigs } from './hooks/usePlanConfigs';

export default function App() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('platino');
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const { plans, customizedPlanIds } = usePlanConfigs();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavigatePublic = (sectionId: string) => {
    if (viewMode !== 'public') {
      setViewMode('public');
      setTimeout(() => scrollToSection(sectionId), 50);
    } else {
      scrollToSection(sectionId);
    }
  };

  const handleOpenAdmin = () => {
    setViewMode('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChoosePlanAndPay = (planId: PlanId) => {
    setSelectedPlan(planId);
    handleNavigatePublic('pagos');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#F6F6F4] text-[#141619]">
        <Navbar
          viewMode={viewMode}
          onSelectEnroll={() => handleNavigatePublic('pagos')}
          onOpenAdmin={handleOpenAdmin}
          onNavigatePublic={handleNavigatePublic}
        />

        <main className="flex-1">
          {viewMode === 'admin' ? (
            <AdminPanel
              plans={plans}
              customizedPlanIds={customizedPlanIds}
              onBackToSite={() => handleNavigatePublic('inicio')}
            />
          ) : (
            <>
              <HeroSection
                plans={plans}
                onExplorePlans={() => scrollToSection('planes')}
                onViewRules={() => scrollToSection('reglamento')}
              />

              <PlansSection
                plans={plans}
                selectedPlan={selectedPlan}
                onChoosePlan={handleChoosePlanAndPay}
              />

              <ComparisonMatrix
                plans={plans}
                selectedPlan={selectedPlan}
                onChoosePlan={handleChoosePlanAndPay}
              />

              <SavingsSimulator
                plans={plans}
                onSelectPlanFromSimulator={handleChoosePlanAndPay}
              />

              <RulesSection plans={plans} />

              <FaqSection
                plans={plans}
                onGoToPayments={() => scrollToSection('pagos')}
              />

              <PaymentSection
                plans={plans}
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
                onOpenAdmin={handleOpenAdmin}
              />
            </>
          )}
        </main>

        <Footer
          onOpenAdmin={handleOpenAdmin}
          onNavigatePublic={handleNavigatePublic}
        />
      </div>
    </ErrorBoundary>
  );
}
