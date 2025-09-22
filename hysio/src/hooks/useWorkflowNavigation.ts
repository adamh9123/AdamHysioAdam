'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type WorkflowType = 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';
export type WorkflowStep =
  | 'patient-info'
  | 'workflow-selection'
  | 'anamnese'
  | 'onderzoek'
  | 'klinische-conclusie'
  | 'conclusie'
  | 'soep-verslag';

interface WorkflowRoute {
  workflow: WorkflowType;
  step?: WorkflowStep;
  path: string;
  title: string;
  description?: string;
}

// Define all workflow routes
const WORKFLOW_ROUTES: WorkflowRoute[] = [
  // Base routes
  { workflow: 'intake-automatisch', path: '/scribe', step: 'patient-info', title: 'Patiëntgegevens' },
  { workflow: 'intake-automatisch', path: '/scribe/workflow', step: 'workflow-selection', title: 'Workflow Selectie' },

  // Automated intake workflow
  { workflow: 'intake-automatisch', path: '/scribe/intake-automatisch', title: 'Hysio Intake (Volledig Automatisch)' },
  { workflow: 'intake-automatisch', step: 'conclusie', path: '/scribe/intake-automatisch/conclusie', title: 'Intake Resultaten' },

  // Step-by-step intake workflow
  { workflow: 'intake-stapsgewijs', step: 'anamnese', path: '/scribe/intake-stapsgewijs/anamnese', title: 'Anamnese' },
  { workflow: 'intake-stapsgewijs', step: 'onderzoek', path: '/scribe/intake-stapsgewijs/onderzoek', title: 'Onderzoek' },
  { workflow: 'intake-stapsgewijs', step: 'klinische-conclusie', path: '/scribe/intake-stapsgewijs/klinische-conclusie', title: 'Klinische Conclusie' },

  // Follow-up consultation workflow
  { workflow: 'consult', path: '/scribe/consult', title: 'Hysio Consult (Vervolgconsult)' },
  { workflow: 'consult', step: 'soep-verslag', path: '/scribe/consult/soep-verslag', title: 'SOEP Verslag' },
];

export interface UseWorkflowNavigationReturn {
  // Current route information
  currentRoute: WorkflowRoute | null;
  currentWorkflow: WorkflowType | null;
  currentStep: WorkflowStep | null;

  // Navigation functions
  navigateToWorkflow: (workflow: WorkflowType) => void;
  navigateToStep: (workflow: WorkflowType, step: WorkflowStep) => void;
  navigateToPatientInfo: () => void;
  navigateToWorkflowSelection: () => void;
  navigateBack: () => void;
  navigateNext: () => void;

  // Route utilities
  getRouteByPath: (path: string) => WorkflowRoute | null;
  getRouteByWorkflowAndStep: (workflow: WorkflowType, step?: WorkflowStep) => WorkflowRoute | null;
  getWorkflowSteps: (workflow: WorkflowType) => WorkflowRoute[];
  getNextStep: (workflow: WorkflowType, currentStep: WorkflowStep) => WorkflowRoute | null;
  getPreviousStep: (workflow: WorkflowType, currentStep: WorkflowStep) => WorkflowRoute | null;

  // Route validation
  isValidWorkflowPath: (path: string) => boolean;
  getWorkflowFromPath: (path: string) => WorkflowType | null;
  getStepFromPath: (path: string) => WorkflowStep | null;

  // Breadcrumb support
  getBreadcrumbs: () => { title: string; path: string; isActive: boolean }[];

  // Progress tracking
  getProgressPercentage: (workflow: WorkflowType, currentStep: WorkflowStep) => number;
}

export const useWorkflowNavigation = (): UseWorkflowNavigationReturn => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentRoute, setCurrentRoute] = useState<WorkflowRoute | null>(null);

  // Update current route when pathname changes
  useEffect(() => {
    const route = WORKFLOW_ROUTES.find(r => r.path === pathname);
    setCurrentRoute(route || null);
  }, [pathname]);

  // Get route by path
  const getRouteByPath = useCallback((path: string): WorkflowRoute | null => {
    return WORKFLOW_ROUTES.find(route => route.path === path) || null;
  }, []);

  // Get route by workflow and step
  const getRouteByWorkflowAndStep = useCallback((workflow: WorkflowType, step?: WorkflowStep): WorkflowRoute | null => {
    return WORKFLOW_ROUTES.find(route =>
      route.workflow === workflow &&
      (step ? route.step === step : !route.step)
    ) || null;
  }, []);

  // Get all steps for a workflow
  const getWorkflowSteps = useCallback((workflow: WorkflowType): WorkflowRoute[] => {
    return WORKFLOW_ROUTES.filter(route => route.workflow === workflow && route.step).sort((a, b) => {
      const stepOrder = ['anamnese', 'onderzoek', 'klinische-conclusie', 'conclusie', 'soep-verslag'];
      const aIndex = stepOrder.indexOf(a.step || '');
      const bIndex = stepOrder.indexOf(b.step || '');
      return aIndex - bIndex;
    });
  }, []);

  // Get next step in workflow
  const getNextStep = useCallback((workflow: WorkflowType, currentStep: WorkflowStep): WorkflowRoute | null => {
    const steps = getWorkflowSteps(workflow);
    const currentIndex = steps.findIndex(step => step.step === currentStep);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      return steps[currentIndex + 1];
    }
    return null;
  }, [getWorkflowSteps]);

  // Get previous step in workflow
  const getPreviousStep = useCallback((workflow: WorkflowType, currentStep: WorkflowStep): WorkflowRoute | null => {
    const steps = getWorkflowSteps(workflow);
    const currentIndex = steps.findIndex(step => step.step === currentStep);
    if (currentIndex > 0) {
      return steps[currentIndex - 1];
    }
    return null;
  }, [getWorkflowSteps]);

  // Navigation functions
  const navigateToWorkflow = useCallback((workflow: WorkflowType) => {
    const route = getRouteByWorkflowAndStep(workflow);
    if (route) {
      router.push(route.path);
    }
  }, [router, getRouteByWorkflowAndStep]);

  const navigateToStep = useCallback((workflow: WorkflowType, step: WorkflowStep) => {
    const route = getRouteByWorkflowAndStep(workflow, step);
    if (route) {
      router.push(route.path);
    }
  }, [router, getRouteByWorkflowAndStep]);

  const navigateToPatientInfo = useCallback(() => {
    router.push('/scribe');
  }, [router]);

  const navigateToWorkflowSelection = useCallback(() => {
    router.push('/scribe/workflow');
  }, [router]);

  const navigateBack = useCallback(() => {
    if (currentRoute) {
      const { workflow } = currentRoute;
      const currentStep = currentRoute.step;

      if (currentStep) {
        const previousStep = getPreviousStep(workflow, currentStep);
        if (previousStep) {
          router.push(previousStep.path);
        } else {
          // If no previous step, go to workflow selection
          navigateToWorkflowSelection();
        }
      } else {
        // If on main workflow page, go to workflow selection
        navigateToWorkflowSelection();
      }
    } else {
      // Fallback to patient info
      navigateToPatientInfo();
    }
  }, [currentRoute, router, getPreviousStep, navigateToWorkflowSelection, navigateToPatientInfo]);

  const navigateNext = useCallback(() => {
    if (currentRoute) {
      const { workflow } = currentRoute;
      const currentStep = currentRoute.step;

      if (currentStep) {
        const nextStep = getNextStep(workflow, currentStep);
        if (nextStep) {
          router.push(nextStep.path);
        }
      }
    }
  }, [currentRoute, router, getNextStep]);

  // Route validation
  const isValidWorkflowPath = useCallback((path: string): boolean => {
    return WORKFLOW_ROUTES.some(route => route.path === path);
  }, []);

  const getWorkflowFromPath = useCallback((path: string): WorkflowType | null => {
    const route = getRouteByPath(path);
    return route?.workflow || null;
  }, [getRouteByPath]);

  const getStepFromPath = useCallback((path: string): WorkflowStep | null => {
    const route = getRouteByPath(path);
    return route?.step || null;
  }, [getRouteByPath]);

  // Breadcrumb support
  const getBreadcrumbs = useCallback(() => {
    const breadcrumbs: { title: string; path: string; isActive: boolean }[] = [];

    if (currentRoute) {
      // Always start with patient info
      breadcrumbs.push({
        title: 'Patiëntgegevens',
        path: '/scribe',
        isActive: pathname === '/scribe'
      });

      // Add workflow selection if not on patient info page
      if (pathname !== '/scribe') {
        breadcrumbs.push({
          title: 'Workflow Selectie',
          path: '/scribe/workflow',
          isActive: pathname === '/scribe/workflow'
        });
      }

      // Add current workflow and steps
      const { workflow } = currentRoute;
      const workflowSteps = getWorkflowSteps(workflow);

      if (workflowSteps.length > 0) {
        // Multi-step workflow
        workflowSteps.forEach(step => {
          breadcrumbs.push({
            title: step.title,
            path: step.path,
            isActive: pathname === step.path
          });
        });
      } else if (currentRoute.path !== '/scribe/workflow') {
        // Single-step workflow
        breadcrumbs.push({
          title: currentRoute.title,
          path: currentRoute.path,
          isActive: pathname === currentRoute.path
        });
      }
    }

    return breadcrumbs;
  }, [currentRoute, pathname, getWorkflowSteps]);

  // Progress tracking
  const getProgressPercentage = useCallback((workflow: WorkflowType, currentStep: WorkflowStep): number => {
    const steps = getWorkflowSteps(workflow);
    if (steps.length === 0) return 100;

    const currentIndex = steps.findIndex(step => step.step === currentStep);
    if (currentIndex === -1) return 0;

    return Math.round(((currentIndex + 1) / steps.length) * 100);
  }, [getWorkflowSteps]);

  return {
    // Current route information
    currentRoute,
    currentWorkflow: currentRoute?.workflow || null,
    currentStep: currentRoute?.step || null,

    // Navigation functions
    navigateToWorkflow,
    navigateToStep,
    navigateToPatientInfo,
    navigateToWorkflowSelection,
    navigateBack,
    navigateNext,

    // Route utilities
    getRouteByPath,
    getRouteByWorkflowAndStep,
    getWorkflowSteps,
    getNextStep,
    getPreviousStep,

    // Route validation
    isValidWorkflowPath,
    getWorkflowFromPath,
    getStepFromPath,

    // Breadcrumb support
    getBreadcrumbs,

    // Progress tracking
    getProgressPercentage,
  };
};