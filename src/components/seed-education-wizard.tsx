"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KeyRound, Shield, Lock, BookCopy } from "lucide-react";
import { cn } from "@/lib/utils";

const WIZARD_STORAGE_KEY = "seedSageWizardCompleted";

const steps = [
  {
    icon: KeyRound,
    title: "What is a Seed Phrase?",
    content: "Your seed phrase is a list of 12-24 words that acts as the master key to all your crypto assets. It's the only way to recover your wallet if you lose your device. Think of it as the ultimate password.",
  },
  {
    icon: Shield,
    title: "How to Store It Safely",
    content: "Store your seed phrase offline. Write it down on paper and keep it in a secure location, like a safe. Never store it digitally (e.g., in a password manager, email, or as a photo) as this makes it vulnerable to hackers.",
  },
  {
    icon: Lock,
    title: "Security DOs and DON'Ts",
    content: "DO: Store it in multiple, secret physical locations. DON'T: Never share it with anyone, not even support staff. Never type it into any website or application unless you are 100% sure you are recovering your wallet.",
  },
  {
    icon: BookCopy,
    title: "Confirm Your Understanding",
    content: "This step is crucial for your security. Please confirm that you have understood the importance of your seed phrase and have stored it securely. Your financial safety depends on it.",
  },
];

export function SeedEducationWizard() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    try {
      const wizardCompleted = localStorage.getItem(WIZARD_STORAGE_KEY);
      if (!wizardCompleted) {
        setIsOpen(true);
      }
    } catch (error) {
      console.warn("Could not access localStorage. Wizard will not show.");
    }
  }, []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem(WIZARD_STORAGE_KEY, "true");
    } catch (error) {
      console.warn("Could not access localStorage. Wizard state not saved.");
    }
    setIsOpen(false);
  };

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-xl">
            <Icon className="h-6 w-6 text-primary" />
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="pt-2">
            Welcome to SeedSage! Let's cover the absolute basics of wallet security.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Progress value={((step + 1) / steps.length) * 100} />
          <p className="text-sm text-muted-foreground">{currentStep.content}</p>
        </div>

        <DialogFooter className="flex justify-between w-full">
            <Button variant="outline" onClick={handleBack} className={cn(step === 0 && "invisible")}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleFinish} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                I Understand and Have Saved My Phrase
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
