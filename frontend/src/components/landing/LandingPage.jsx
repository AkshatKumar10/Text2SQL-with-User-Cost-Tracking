import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import WorkflowSection from './WorkflowSection';
import DatasetsSection from './DatasetsSection';
import ObservabilitySection from './ObservabilitySection';
import CTASection from './CTASection';
import Footer from './Footer';

export function LandingPage({
  onTryFree,
}) {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div>
      <main>
        <HeroSection
          onTryFree={onTryFree}
        />
        <FeaturesSection />
        <WorkflowSection />
        <DatasetsSection />
        <ObservabilitySection />
        <CTASection
          onTryFree={onTryFree}
        />
      </main>

      <Footer
        onTryFree={onTryFree}
        scrollToSection={scrollToSection}
      />
    </div>
  );
}