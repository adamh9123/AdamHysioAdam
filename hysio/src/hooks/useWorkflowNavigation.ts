'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type WorkflowType = 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';
export type WorkflowStep =
  | 'patient-info'
  | 'workflow-selection'
  | 'anamnese'
  | 'anamnese-resultaat'
  | 'onderzoek'
  | 'onderzoek-resultaat'
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
  { workflow: 'intake-automatisch', path: '/scribe/intake-automatisch', title: 'Hysio Intake (Automatisch)' },
  { workflow: 'intake-automatisch', step: 'conclusie', path: '/scribe/intake-automatisch/conclusie', title: 'Intake Resultaten' },

  // Step-by-step intake workflow
  { workflow: 'intake-stapsgewijs', step: 'anamnese', path: '/scribe/intake-stapsgewijs/anamnese', title: 'Anamnese' },
  { workflow: 'intake-stapsgewijs', step: 'anamnese-resultaat', path: '/scribe/intake-stapsgewijs/anamnese-resultaat', title: 'Anamnese Resultaten' },
  { workflow: 'intake-stapsgewijs', step: 'onderzoek', path: '/scribe/intake-stapsgewijs/onderzoek', title: 'Onderzoek' },
  { workflow: 'intake-stapsgewijs', step: 'onderzoek-resultaat', path: '/scribe/intake-stapsgewijs/onderzoek-resultaat', title: 'Onderzoek Resultaten' },
  { workflow: 'intake-stapsgewijs', step: 'klinische-conclusie', path: '/scribe/intake-stapsgewijs/klinische-conclusie', title: 'Klinische Conclusie' },
  { workflow: 'intake-stapsgewijs', step: 'conclusie', path: '/scribe/intake-stapsgewijs/conclusie', title: 'Volledige Intake Resultaten' },

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

  // Step-by-step workflow specific navigation
  getNextStepwiseStep: (currentStep: WorkflowStep) => WorkflowRoute | null;
  getPreviousStepwiseStep: (currentStep: WorkflowStep) => WorkflowRoute | null;
  navigateToNextStepwiseStep: (currentStep: WorkflowStep) => void;
  navigateToPreviousStepwiseStep: (currentStep: WorkflowStep) => void;

  // Step-by-step workflow utilities
  isStepwiseResultPage: (step: WorkflowStep) => boolean;
  isStepwiseInputPage: (step: WorkflowStep) => boolean;
  getCorrespondingResultPage: (inputStep: WorkflowStep) => WorkflowRoute | null;
  getCorrespondingInputPage: (resultStep: WorkflowStep) => WorkflowRoute | null;
  getStepwiseWorkflowProgress: (currentStep: WorkflowStep) => { current: number; total: number; percentage: number };

  // Enhanced navigation flow
  navigateToStepwiseResult: (inputStep: WorkflowStep) => void;
  navigateFromResultToNextInput: (resultStep: WorkflowStep) => void;

  // Enhanced error handling and fallback navigation
  safeNavigateToStep: (workflow: WorkflowType, step: WorkflowStep, fallbackPath?: string) => Promise<boolean>;
  safeNavigateWithRetry: (path: string, retries?: number, fallbackPath?: string) => Promise<boolean>;
  isNavigationSafe: (path: string) => boolean;
  getNavigationFallback: (intendedPath: string) => string;

  // Navigation state persistence
  saveNavigationState: (currentPath: string, intendedPath: string, metadata?: Record<string, any>) => void;
  getNavigationState: () => { currentPath: string; intendedPath: string; timestamp: number; metadata?: Record<string, any> } | null;
  clearNavigationState: () => void;
  restoreNavigationAfterFailure: () => Promise<boolean>;
  persistNavigationContext: (context: Record<string, any>) => void;
  getNavigationContext: () => Record<string, any> | null;

  // Navigation timing optimization and async state waiting
  waitForStateStabilization: (stateCheck: () => boolean, maxWaitMs?: number) => Promise<boolean>;
  navigateWithStateWait: (path: string, stateCheck?: () => boolean, maxWaitMs?: number) => Promise<boolean>;
  navigateToStepWithStateWait: (workflow: WorkflowType, step: WorkflowStep, stateCheck?: () => boolean) => Promise<boolean>;
  createStateChecker: (requiredFields: string[], stateStore: any) => () => boolean;
  getOptimalNavigationDelay: (workflowType: WorkflowType) => number;

  // Automatic retry mechanism for failed navigations
  navigateWithAutoRetry: (path: string, options?: {
    maxRetries?: number;
    retryDelay?: number;
    stateCheck?: () => boolean;
    fallbackPath?: string;
  }) => Promise<boolean>;
  retryFailedNavigation: (navigationId: string) => Promise<boolean>;
  getNavigationHistory: () => Array<{ id: string; path: string; timestamp: number; status: 'success' | 'failed' | 'retry' }>;
  clearNavigationHistory: () => void;

  // Navigation debugging utilities for development troubleshooting
  enableNavigationDebugging: (enabled: boolean) => void;
  getNavigationDebugInfo: () => {
    currentRoute: WorkflowRoute | null;
    availableRoutes: WorkflowRoute[];
    recentNavigations: Array<{ path: string; timestamp: number; status: string }>;
    persistedState: any;
    browserPath: string;
  };
  logNavigationEvent: (event: string, data?: any) => void;
  validateNavigationIntegrity: () => { isValid: boolean; issues: string[] };
  exportNavigationDebugReport: () => string;
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
      const stepOrder = ['anamnese', 'anamnese-resultaat', 'onderzoek', 'onderzoek-resultaat', 'klinische-conclusie', 'conclusie', 'soep-verslag'];
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

  // Step-by-step workflow specific navigation
  const getNextStepwiseStep = useCallback((currentStep: WorkflowStep): WorkflowRoute | null => {
    return getNextStep('intake-stapsgewijs', currentStep);
  }, [getNextStep]);

  const getPreviousStepwiseStep = useCallback((currentStep: WorkflowStep): WorkflowRoute | null => {
    return getPreviousStep('intake-stapsgewijs', currentStep);
  }, [getPreviousStep]);

  const navigateToNextStepwiseStep = useCallback((currentStep: WorkflowStep) => {
    const nextStep = getNextStepwiseStep(currentStep);
    if (nextStep) {
      router.push(nextStep.path);
    }
  }, [router, getNextStepwiseStep]);

  const navigateToPreviousStepwiseStep = useCallback((currentStep: WorkflowStep) => {
    const prevStep = getPreviousStepwiseStep(currentStep);
    if (prevStep) {
      router.push(prevStep.path);
    }
  }, [router, getPreviousStepwiseStep]);

  // Step-by-step workflow utilities
  const isStepwiseResultPage = useCallback((step: WorkflowStep): boolean => {
    return ['anamnese-resultaat', 'onderzoek-resultaat', 'conclusie'].includes(step);
  }, []);

  const isStepwiseInputPage = useCallback((step: WorkflowStep): boolean => {
    return ['anamnese', 'onderzoek', 'klinische-conclusie'].includes(step);
  }, []);

  const getCorrespondingResultPage = useCallback((inputStep: WorkflowStep): WorkflowRoute | null => {
    const resultStepMap: Record<string, WorkflowStep> = {
      'anamnese': 'anamnese-resultaat',
      'onderzoek': 'onderzoek-resultaat',
      'klinische-conclusie': 'conclusie'
    };

    const resultStep = resultStepMap[inputStep];
    if (resultStep) {
      return getRouteByWorkflowAndStep('intake-stapsgewijs', resultStep);
    }
    return null;
  }, [getRouteByWorkflowAndStep]);

  const getCorrespondingInputPage = useCallback((resultStep: WorkflowStep): WorkflowRoute | null => {
    const inputStepMap: Record<string, WorkflowStep> = {
      'anamnese-resultaat': 'anamnese',
      'onderzoek-resultaat': 'onderzoek',
      'conclusie': 'klinische-conclusie'
    };

    const inputStep = inputStepMap[resultStep];
    if (inputStep) {
      return getRouteByWorkflowAndStep('intake-stapsgewijs', inputStep);
    }
    return null;
  }, [getRouteByWorkflowAndStep]);

  const getStepwiseWorkflowProgress = useCallback((currentStep: WorkflowStep): { current: number; total: number; percentage: number } => {
    const stepOrder = ['anamnese', 'anamnese-resultaat', 'onderzoek', 'onderzoek-resultaat', 'klinische-conclusie', 'conclusie'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const total = stepOrder.length;

    if (currentIndex === -1) {
      return { current: 0, total, percentage: 0 };
    }

    const current = currentIndex + 1;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  }, []);

  // Enhanced navigation flow
  const navigateToStepwiseResult = useCallback((inputStep: WorkflowStep) => {
    const resultPage = getCorrespondingResultPage(inputStep);
    if (resultPage) {
      router.push(resultPage.path);
    }
  }, [router, getCorrespondingResultPage]);

  const navigateFromResultToNextInput = useCallback((resultStep: WorkflowStep) => {
    const nextStep = getNextStepwiseStep(resultStep);
    if (nextStep) {
      router.push(nextStep.path);
    }
  }, [router, getNextStepwiseStep]);

  // Enhanced error handling and fallback navigation
  const isNavigationSafe = useCallback((path: string): boolean => {
    return isValidWorkflowPath(path) && typeof window !== 'undefined';
  }, [isValidWorkflowPath]);

  const getNavigationFallback = useCallback((intendedPath: string): string => {
    // Workflow-specific fallbacks
    if (intendedPath.includes('/scribe/consult/soep-verslag')) {
      return '/scribe/consult';
    }
    if (intendedPath.includes('/scribe/intake-automatisch/conclusie')) {
      return '/scribe/intake-automatisch';
    }
    if (intendedPath.includes('/scribe/intake-stapsgewijs/')) {
      if (intendedPath.includes('-resultaat') || intendedPath.includes('/conclusie')) {
        // If going to a result page fails, go back to the corresponding input page
        if (intendedPath.includes('anamnese-resultaat')) return '/scribe/intake-stapsgewijs/anamnese';
        if (intendedPath.includes('onderzoek-resultaat')) return '/scribe/intake-stapsgewijs/onderzoek';
        if (intendedPath.includes('/conclusie')) return '/scribe/intake-stapsgewijs/klinische-conclusie';
      }
      return '/scribe/workflow'; // General step-wise fallback
    }
    // Global fallbacks
    return '/scribe/workflow';
  }, []);

  const safeNavigateWithRetry = useCallback(async (
    path: string,
    retries: number = 3,
    fallbackPath?: string
  ): Promise<boolean> => {
    if (!isNavigationSafe(path)) {
      console.warn(`Navigation to ${path} is not safe, using fallback`);
      const fallback = fallbackPath || getNavigationFallback(path);
      router.push(fallback);
      return false;
    }

    let attempt = 0;
    while (attempt < retries) {
      try {
        console.log(`Navigation attempt ${attempt + 1} to ${path}`);

        // Add a small delay to allow state stabilization
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 + (attempt * 500)));
        }

        router.push(path);

        // Wait a moment to see if navigation was successful
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if we're on the intended path (basic verification)
        if (typeof window !== 'undefined' && window.location.pathname === path) {
          console.log(`Navigation to ${path} successful on attempt ${attempt + 1}`);
          return true;
        }

        attempt++;
      } catch (error) {
        console.error(`Navigation attempt ${attempt + 1} failed:`, error);
        attempt++;
      }
    }

    // All retries failed, use fallback
    console.error(`All navigation attempts to ${path} failed, using fallback`);
    const fallback = fallbackPath || getNavigationFallback(path);
    router.push(fallback);
    return false;
  }, [router, isNavigationSafe, getNavigationFallback]);

  const safeNavigateToStep = useCallback(async (
    workflow: WorkflowType,
    step: WorkflowStep,
    fallbackPath?: string
  ): Promise<boolean> => {
    const route = getRouteByWorkflowAndStep(workflow, step);
    if (!route) {
      console.error(`No route found for ${workflow}/${step}`);
      const fallback = fallbackPath || '/scribe/workflow';
      router.push(fallback);
      return false;
    }

    return safeNavigateWithRetry(route.path, 3, fallbackPath);
  }, [router, getRouteByWorkflowAndStep, safeNavigateWithRetry]);

  // Navigation state persistence
  const saveNavigationState = useCallback((
    currentPath: string,
    intendedPath: string,
    metadata?: Record<string, any>
  ) => {
    if (typeof window === 'undefined') return;

    try {
      const navigationState = {
        currentPath,
        intendedPath,
        timestamp: Date.now(),
        metadata
      };

      localStorage.setItem('hysio-navigation-state', JSON.stringify(navigationState));
      console.log('Navigation state saved:', navigationState);
    } catch (error) {
      console.error('Failed to save navigation state:', error);
    }
  }, []);

  const getNavigationState = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const stateJson = localStorage.getItem('hysio-navigation-state');
      if (!stateJson) return null;

      const state = JSON.parse(stateJson);

      // Check if state is not too old (expire after 1 hour)
      if (Date.now() - state.timestamp > 60 * 60 * 1000) {
        localStorage.removeItem('hysio-navigation-state');
        return null;
      }

      return state;
    } catch (error) {
      console.error('Failed to get navigation state:', error);
      return null;
    }
  }, []);

  const clearNavigationState = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('hysio-navigation-state');
      localStorage.removeItem('hysio-navigation-context');
      console.log('Navigation state cleared');
    } catch (error) {
      console.error('Failed to clear navigation state:', error);
    }
  }, []);

  const restoreNavigationAfterFailure = useCallback(async (): Promise<boolean> => {
    const savedState = getNavigationState();
    if (!savedState) {
      console.log('No navigation state to restore');
      return false;
    }

    console.log('Attempting to restore navigation:', savedState);

    try {
      // Try to navigate to the intended path first
      const success = await safeNavigateWithRetry(savedState.intendedPath, 2);

      if (success) {
        console.log('Successfully restored navigation to intended path:', savedState.intendedPath);
        clearNavigationState();
        return true;
      } else {
        // If intended path fails, try current path
        console.log('Intended path failed, trying current path:', savedState.currentPath);
        router.push(savedState.currentPath);
        clearNavigationState();
        return true;
      }
    } catch (error) {
      console.error('Failed to restore navigation:', error);
      clearNavigationState();
      return false;
    }
  }, [getNavigationState, safeNavigateWithRetry, clearNavigationState, router]);

  const persistNavigationContext = useCallback((context: Record<string, any>) => {
    if (typeof window === 'undefined') return;

    try {
      const contextWithTimestamp = {
        ...context,
        timestamp: Date.now()
      };

      localStorage.setItem('hysio-navigation-context', JSON.stringify(contextWithTimestamp));
      console.log('Navigation context persisted:', contextWithTimestamp);
    } catch (error) {
      console.error('Failed to persist navigation context:', error);
    }
  }, []);

  const getNavigationContext = useCallback((): Record<string, any> | null => {
    if (typeof window === 'undefined') return null;

    try {
      const contextJson = localStorage.getItem('hysio-navigation-context');
      if (!contextJson) return null;

      const context = JSON.parse(contextJson);

      // Check if context is not too old (expire after 1 hour)
      if (Date.now() - context.timestamp > 60 * 60 * 1000) {
        localStorage.removeItem('hysio-navigation-context');
        return null;
      }

      // Remove timestamp from returned context
      const { timestamp, ...cleanContext } = context;
      return cleanContext;
    } catch (error) {
      console.error('Failed to get navigation context:', error);
      return null;
    }
  }, []);

  // Navigation timing optimization and async state waiting
  const waitForStateStabilization = useCallback(async (
    stateCheck: () => boolean,
    maxWaitMs: number = 5000
  ): Promise<boolean> => {
    const startTime = Date.now();
    const checkInterval = 100; // Check every 100ms

    console.log('Waiting for state stabilization...');

    while (Date.now() - startTime < maxWaitMs) {
      try {
        if (stateCheck()) {
          const waitTime = Date.now() - startTime;
          console.log(`State stabilized after ${waitTime}ms`);
          return true;
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        console.error('Error during state check:', error);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }
    }

    const totalWaitTime = Date.now() - startTime;
    console.warn(`State stabilization timeout after ${totalWaitTime}ms`);
    return false;
  }, []);

  const getOptimalNavigationDelay = useCallback((workflowType: WorkflowType): number => {
    // Different workflows have different state complexity
    switch (workflowType) {
      case 'intake-automatisch':
        return 2000; // More complex state, longer delay
      case 'intake-stapsgewijs':
        return 1500; // Step-by-step has intermediate complexity
      case 'consult':
        return 1000; // Consult is simpler
      default:
        return 1000;
    }
  }, []);

  const createStateChecker = useCallback((
    requiredFields: string[],
    stateStore: any
  ): (() => boolean) => {
    return () => {
      try {
        // Check if all required fields are present and not null/undefined
        for (const field of requiredFields) {
          const value = stateStore?.[field];
          if (value === null || value === undefined) {
            console.log(`State check failed: ${field} is ${value}`);
            return false;
          }
        }

        console.log('State check passed: all required fields present');
        return true;
      } catch (error) {
        console.error('State check error:', error);
        return false;
      }
    };
  }, []);

  const navigateWithStateWait = useCallback(async (
    path: string,
    stateCheck?: () => boolean,
    maxWaitMs: number = 5000
  ): Promise<boolean> => {
    console.log(`Starting navigation with state wait to: ${path}`);

    // Save current navigation state before attempting navigation
    if (typeof window !== 'undefined') {
      saveNavigationState(window.location.pathname, path, {
        timestamp: Date.now(),
        withStateWait: true
      });
    }

    try {
      if (stateCheck) {
        console.log('Waiting for custom state check...');
        const stateReady = await waitForStateStabilization(stateCheck, maxWaitMs);

        if (!stateReady) {
          console.warn('State check failed, proceeding with navigation anyway');
        }
      } else {
        // Default minimum wait to allow React state to stabilize
        const optimalDelay = getOptimalNavigationDelay('intake-stapsgewijs'); // Default
        console.log(`Applying default stabilization delay: ${optimalDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, optimalDelay));
      }

      // Perform the navigation
      console.log(`Executing navigation to: ${path}`);
      router.push(path);

      // Wait a bit to see if navigation was successful
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear saved state if navigation seems successful
      clearNavigationState();

      console.log(`Navigation completed to: ${path}`);
      return true;

    } catch (error) {
      console.error('Navigation with state wait failed:', error);

      // Try fallback navigation
      const fallback = getNavigationFallback(path);
      console.log(`Attempting fallback navigation to: ${fallback}`);
      router.push(fallback);

      return false;
    }
  }, [router, saveNavigationState, waitForStateStabilization, getOptimalNavigationDelay, clearNavigationState, getNavigationFallback]);

  const navigateToStepWithStateWait = useCallback(async (
    workflow: WorkflowType,
    step: WorkflowStep,
    stateCheck?: () => boolean
  ): Promise<boolean> => {
    const route = getRouteByWorkflowAndStep(workflow, step);
    if (!route) {
      console.error(`No route found for ${workflow}/${step}`);
      return false;
    }

    const optimalDelay = getOptimalNavigationDelay(workflow);
    console.log(`Using optimal delay for ${workflow}: ${optimalDelay}ms`);

    return navigateWithStateWait(route.path, stateCheck, optimalDelay + 1000);
  }, [getRouteByWorkflowAndStep, getOptimalNavigationDelay, navigateWithStateWait]);

  // Automatic retry mechanism for failed navigations
  const getNavigationHistory = useCallback(() => {
    if (typeof window === 'undefined') return [];

    try {
      const historyJson = localStorage.getItem('hysio-navigation-history');
      if (!historyJson) return [];

      const history = JSON.parse(historyJson);

      // Clean old entries (older than 1 hour)
      const cutoffTime = Date.now() - (60 * 60 * 1000);
      const cleanHistory = history.filter((entry: any) => entry.timestamp > cutoffTime);

      if (cleanHistory.length !== history.length) {
        localStorage.setItem('hysio-navigation-history', JSON.stringify(cleanHistory));
      }

      return cleanHistory;
    } catch (error) {
      console.error('Failed to get navigation history:', error);
      return [];
    }
  }, []);

  const clearNavigationHistory = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('hysio-navigation-history');
      console.log('Navigation history cleared');
    } catch (error) {
      console.error('Failed to clear navigation history:', error);
    }
  }, []);

  const addToNavigationHistory = useCallback((
    path: string,
    status: 'success' | 'failed' | 'retry'
  ) => {
    if (typeof window === 'undefined') return;

    try {
      const history = getNavigationHistory();
      const navigationId = `nav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newEntry = {
        id: navigationId,
        path,
        timestamp: Date.now(),
        status
      };

      history.push(newEntry);

      // Keep only last 50 entries
      const trimmedHistory = history.slice(-50);

      localStorage.setItem('hysio-navigation-history', JSON.stringify(trimmedHistory));
      console.log(`Added to navigation history: ${path} - ${status}`);
    } catch (error) {
      console.error('Failed to add to navigation history:', error);
    }
  }, [getNavigationHistory]);

  const navigateWithAutoRetry = useCallback(async (
    path: string,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      stateCheck?: () => boolean;
      fallbackPath?: string;
    } = {}
  ): Promise<boolean> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      stateCheck,
      fallbackPath
    } = options;

    console.log(`Starting navigation with auto-retry to: ${path}`);
    console.log(`Options: maxRetries=${maxRetries}, retryDelay=${retryDelay}ms`);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt}/${maxRetries} to: ${path}`);

        // Use our enhanced navigation with state waiting
        const success = await navigateWithStateWait(path, stateCheck);

        if (success) {
          console.log(`Navigation succeeded on attempt ${attempt}`);
          addToNavigationHistory(path, 'success');
          return true;
        }

        if (attempt < maxRetries) {
          console.log(`Navigation attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
          addToNavigationHistory(path, 'retry');

          // Progressive delay: each retry takes longer
          const progressiveDelay = retryDelay * attempt;
          await new Promise(resolve => setTimeout(resolve, progressiveDelay));
        }
      } catch (error) {
        console.error(`Navigation attempt ${attempt} threw error:`, error);

        if (attempt < maxRetries) {
          addToNavigationHistory(path, 'retry');
          const progressiveDelay = retryDelay * attempt;
          await new Promise(resolve => setTimeout(resolve, progressiveDelay));
        }
      }
    }

    // All retries failed
    console.error(`All ${maxRetries} navigation attempts failed for: ${path}`);
    addToNavigationHistory(path, 'failed');

    // Try fallback
    const finalFallback = fallbackPath || getNavigationFallback(path);
    console.log(`Attempting final fallback navigation to: ${finalFallback}`);

    try {
      router.push(finalFallback);
      addToNavigationHistory(finalFallback, 'success');
      return false; // Return false because primary navigation failed
    } catch (error) {
      console.error('Even fallback navigation failed:', error);
      return false;
    }
  }, [navigateWithStateWait, addToNavigationHistory, getNavigationFallback, router]);

  const retryFailedNavigation = useCallback(async (navigationId: string): Promise<boolean> => {
    const history = getNavigationHistory();
    const failedEntry = history.find(entry => entry.id === navigationId && entry.status === 'failed');

    if (!failedEntry) {
      console.error(`Failed navigation with ID ${navigationId} not found in history`);
      return false;
    }

    console.log(`Retrying failed navigation: ${failedEntry.path}`);

    return navigateWithAutoRetry(failedEntry.path, {
      maxRetries: 2, // Reduced retries for manual retry
      retryDelay: 500
    });
  }, [getNavigationHistory, navigateWithAutoRetry]);

  // Navigation debugging utilities for development troubleshooting
  const enableNavigationDebugging = useCallback((enabled: boolean) => {
    if (typeof window === 'undefined') return;

    try {
      if (enabled) {
        localStorage.setItem('hysio-navigation-debug', 'true');
        console.log('🚀 Navigation debugging enabled');
        console.log('Available debug methods:');
        console.log('- window.hysioDebug.getNavigationDebugInfo()');
        console.log('- window.hysioDebug.validateNavigationIntegrity()');
        console.log('- window.hysioDebug.exportNavigationDebugReport()');

        // Expose debug methods globally in development
        if (process.env.NODE_ENV === 'development') {
          (window as any).hysioDebug = {
            getNavigationDebugInfo: () => getNavigationDebugInfo(),
            validateNavigationIntegrity: () => validateNavigationIntegrity(),
            exportNavigationDebugReport: () => exportNavigationDebugReport(),
            getNavigationHistory: () => getNavigationHistory(),
            clearNavigationHistory: () => clearNavigationHistory()
          };
        }
      } else {
        localStorage.removeItem('hysio-navigation-debug');
        console.log('🔇 Navigation debugging disabled');

        if ((window as any).hysioDebug) {
          delete (window as any).hysioDebug;
        }
      }
    } catch (error) {
      console.error('Failed to toggle navigation debugging:', error);
    }
  }, []);

  const logNavigationEvent = useCallback((event: string, data?: any) => {
    if (typeof window === 'undefined') return;

    const debugEnabled = localStorage.getItem('hysio-navigation-debug') === 'true';
    if (!debugEnabled) return;

    const timestamp = new Date().toISOString();
    const logMessage = `🧭 [${timestamp}] Navigation Event: ${event}`;

    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }

    // Store debug events for report generation
    try {
      const debugEvents = JSON.parse(localStorage.getItem('hysio-debug-events') || '[]');
      debugEvents.push({
        timestamp,
        event,
        data: data ? JSON.stringify(data) : null
      });

      // Keep only last 100 events
      const trimmedEvents = debugEvents.slice(-100);
      localStorage.setItem('hysio-debug-events', JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error('Failed to store debug event:', error);
    }
  }, []);

  const getNavigationDebugInfo = useCallback(() => {
    const debugInfo = {
      currentRoute,
      availableRoutes: WORKFLOW_ROUTES,
      recentNavigations: getNavigationHistory(),
      persistedState: {
        navigationState: getNavigationState(),
        navigationContext: getNavigationContext()
      },
      browserPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
      timestamp: new Date().toISOString()
    };

    logNavigationEvent('DEBUG_INFO_ACCESSED', { pathsCount: WORKFLOW_ROUTES.length });
    return debugInfo;
  }, [currentRoute, getNavigationHistory, getNavigationState, getNavigationContext, logNavigationEvent]);

  const validateNavigationIntegrity = useCallback(() => {
    const issues: string[] = [];
    let isValid = true;

    try {
      // Check if all routes have valid paths
      WORKFLOW_ROUTES.forEach((route, index) => {
        if (!route.path || !route.path.startsWith('/')) {
          issues.push(`Route ${index}: Invalid path "${route.path}"`);
          isValid = false;
        }

        if (!route.title || route.title.trim().length === 0) {
          issues.push(`Route ${index}: Missing or empty title`);
          isValid = false;
        }

        if (!route.workflow) {
          issues.push(`Route ${index}: Missing workflow type`);
          isValid = false;
        }
      });

      // Check for duplicate paths
      const pathCounts = new Map<string, number>();
      WORKFLOW_ROUTES.forEach(route => {
        const count = pathCounts.get(route.path) || 0;
        pathCounts.set(route.path, count + 1);
      });

      pathCounts.forEach((count, path) => {
        if (count > 1) {
          issues.push(`Duplicate path detected: "${path}" appears ${count} times`);
          isValid = false;
        }
      });

      // Check stepwise workflow completeness
      const stepwiseRoutes = WORKFLOW_ROUTES.filter(r => r.workflow === 'intake-stapsgewijs');
      const requiredStepwiseSteps = ['anamnese', 'anamnese-resultaat', 'onderzoek', 'onderzoek-resultaat', 'klinische-conclusie', 'conclusie'];

      requiredStepwiseSteps.forEach(step => {
        const hasStep = stepwiseRoutes.some(r => r.step === step);
        if (!hasStep) {
          issues.push(`Missing required stepwise step: "${step}"`);
          isValid = false;
        }
      });

      // Check current route validity
      if (currentRoute) {
        const routeExists = WORKFLOW_ROUTES.some(r => r.path === currentRoute.path);
        if (!routeExists) {
          issues.push(`Current route "${currentRoute.path}" not found in WORKFLOW_ROUTES`);
          isValid = false;
        }
      }

      // Check browser path consistency
      if (typeof window !== 'undefined') {
        const browserPath = window.location.pathname;
        if (currentRoute && currentRoute.path !== browserPath) {
          issues.push(`Route mismatch: currentRoute.path="${currentRoute.path}" but browser path="${browserPath}"`);
          // This might not be an error in all cases, so don't mark as invalid
        }
      }

      logNavigationEvent('INTEGRITY_CHECK', { isValid, issuesCount: issues.length });

      return { isValid, issues };
    } catch (error) {
      console.error('Navigation integrity validation error:', error);
      return {
        isValid: false,
        issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }, [currentRoute, logNavigationEvent]);

  const exportNavigationDebugReport = useCallback(() => {
    try {
      const debugInfo = getNavigationDebugInfo();
      const integrityCheck = validateNavigationIntegrity();

      const debugEvents = JSON.parse(localStorage.getItem('hysio-debug-events') || '[]');

      const report = {
        timestamp: new Date().toISOString(),
        version: 'Hysio Medical Scribe v7.0',
        debugInfo,
        integrityCheck,
        debugEvents: debugEvents.slice(-50), // Last 50 events
        systemInfo: {
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
          href: typeof window !== 'undefined' ? window.location.href : 'N/A',
          referrer: typeof window !== 'undefined' ? document.referrer : 'N/A'
        }
      };

      const reportJson = JSON.stringify(report, null, 2);

      logNavigationEvent('DEBUG_REPORT_EXPORTED', { reportSize: reportJson.length });

      // In development, also log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('🧭 Navigation Debug Report:', report);
      }

      return reportJson;
    } catch (error) {
      console.error('Failed to export navigation debug report:', error);
      return JSON.stringify({
        error: 'Failed to generate debug report',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, null, 2);
    }
  }, [getNavigationDebugInfo, validateNavigationIntegrity, logNavigationEvent]);

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

    // Step-by-step workflow specific navigation
    getNextStepwiseStep,
    getPreviousStepwiseStep,
    navigateToNextStepwiseStep,
    navigateToPreviousStepwiseStep,

    // Step-by-step workflow utilities
    isStepwiseResultPage,
    isStepwiseInputPage,
    getCorrespondingResultPage,
    getCorrespondingInputPage,
    getStepwiseWorkflowProgress,

    // Enhanced navigation flow
    navigateToStepwiseResult,
    navigateFromResultToNextInput,

    // Enhanced error handling and fallback navigation
    safeNavigateToStep,
    safeNavigateWithRetry,
    isNavigationSafe,
    getNavigationFallback,

    // Navigation state persistence
    saveNavigationState,
    getNavigationState,
    clearNavigationState,
    restoreNavigationAfterFailure,
    persistNavigationContext,
    getNavigationContext,

    // Navigation timing optimization and async state waiting
    waitForStateStabilization,
    navigateWithStateWait,
    navigateToStepWithStateWait,
    createStateChecker,
    getOptimalNavigationDelay,

    // Automatic retry mechanism for failed navigations
    navigateWithAutoRetry,
    retryFailedNavigation,
    getNavigationHistory,
    clearNavigationHistory,

    // Navigation debugging utilities for development troubleshooting
    enableNavigationDebugging,
    getNavigationDebugInfo,
    logNavigationEvent,
    validateNavigationIntegrity,
    exportNavigationDebugReport,
  };
};