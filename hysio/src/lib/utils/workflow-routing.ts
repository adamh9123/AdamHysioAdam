/**
 * Workflow Routing Utilities
 *
 * This module provides comprehensive routing utilities for the Hysio Medical Scribe
 * multi-page workflow system. It handles URL generation, validation, and navigation
 * logic for all three workflow types.
 */

export type WorkflowType = 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';
export type WorkflowStep =
  | 'patient-info'
  | 'workflow-selection'
  | 'anamnese'
  | 'onderzoek'
  | 'klinische-conclusie'
  | 'conclusie'
  | 'soep-verslag';

export interface WorkflowRoute {
  id: string;
  workflow: WorkflowType;
  step?: WorkflowStep;
  path: string;
  title: string;
  description?: string;
  isTerminal?: boolean; // Final step in a workflow
  requiresData?: string[]; // Required data keys to access this route
}

// Define the complete route map for all workflows
export const WORKFLOW_ROUTES: Record<string, WorkflowRoute> = {
  // Base application routes
  'patient-info': {
    id: 'patient-info',
    workflow: 'intake-automatisch', // Default workflow for base route
    step: 'patient-info',
    path: '/scribe',
    title: 'Patiëntgegevens',
    description: 'Invoer van patiëntinformatie voor nieuwe sessie',
  },
  'workflow-selection': {
    id: 'workflow-selection',
    workflow: 'intake-automatisch', // Default workflow for base route
    step: 'workflow-selection',
    path: '/scribe/workflow',
    title: 'Workflow Selectie',
    description: 'Keuze tussen drie workflow types',
    requiresData: ['patientInfo'],
  },

  // Automated intake workflow
  'intake-automatisch-input': {
    id: 'intake-automatisch-input',
    workflow: 'intake-automatisch',
    path: '/scribe/intake-automatisch',
    title: 'Hysio Intake (Automatisch)',
    description: 'Automatische intake verwerking in één sessie',
    requiresData: ['patientInfo'],
  },
  'intake-automatisch-conclusie': {
    id: 'intake-automatisch-conclusie',
    workflow: 'intake-automatisch',
    step: 'conclusie',
    path: '/scribe/intake-automatisch/conclusie',
    title: 'Intake Resultaten',
    description: 'HHSB-gestructureerde documentatie van automatische intake',
    isTerminal: true,
    requiresData: ['patientInfo', 'automatedIntakeData'],
  },

  // Step-by-step intake workflow
  'intake-stapsgewijs-anamnese': {
    id: 'intake-stapsgewijs-anamnese',
    workflow: 'intake-stapsgewijs',
    step: 'anamnese',
    path: '/scribe/intake-stapsgewijs/anamnese',
    title: 'Anamnese',
    description: 'Anamnese voorbereiding en opname',
    requiresData: ['patientInfo'],
  },
  'intake-stapsgewijs-onderzoek': {
    id: 'intake-stapsgewijs-onderzoek',
    workflow: 'intake-stapsgewijs',
    step: 'onderzoek',
    path: '/scribe/intake-stapsgewijs/onderzoek',
    title: 'Onderzoek',
    description: 'Onderzoeksvoorbereiding en bevindingen',
    requiresData: ['patientInfo', 'anamneseData'],
  },
  'intake-stapsgewijs-klinische-conclusie': {
    id: 'intake-stapsgewijs-klinische-conclusie',
    workflow: 'intake-stapsgewijs',
    step: 'klinische-conclusie',
    path: '/scribe/intake-stapsgewijs/klinische-conclusie',
    title: 'Klinische Conclusie',
    description: 'Eindconclusie en behandelplan',
    isTerminal: true,
    requiresData: ['patientInfo', 'anamneseData', 'onderzoekData'],
  },

  // Follow-up consultation workflow
  'consult-input': {
    id: 'consult-input',
    workflow: 'consult',
    path: '/scribe/consult',
    title: 'Hysio Consult (Vervolgconsult)',
    description: 'Vervolgconsult met SOEP-methodiek',
    requiresData: ['patientInfo'],
  },
  'consult-soep-verslag': {
    id: 'consult-soep-verslag',
    workflow: 'consult',
    step: 'soep-verslag',
    path: '/scribe/consult/soep-verslag',
    title: 'SOEP Verslag',
    description: 'SOEP-gestructureerde rapportage van vervolgconsult',
    isTerminal: true,
    requiresData: ['patientInfo', 'consultData'],
  },
};

/**
 * Route generation utilities
 */
export class WorkflowRouter {
  /**
   * Generate URL for a specific workflow and optional step
   */
  static generateUrl(workflow: WorkflowType, step?: WorkflowStep): string {
    const route = this.getRouteByWorkflowAndStep(workflow, step);
    return route?.path || '/scribe';
  }

  /**
   * Generate URL for workflow start (first page of workflow)
   */
  static generateWorkflowStartUrl(workflow: WorkflowType): string {
    switch (workflow) {
      case 'intake-automatisch':
        return '/scribe/intake-automatisch';
      case 'intake-stapsgewijs':
        return '/scribe/intake-stapsgewijs/anamnese';
      case 'consult':
        return '/scribe/consult';
      default:
        return '/scribe';
    }
  }

  /**
   * Generate URL for workflow completion (final page of workflow)
   */
  static generateWorkflowEndUrl(workflow: WorkflowType): string {
    switch (workflow) {
      case 'intake-automatisch':
        return '/scribe/intake-automatisch/conclusie';
      case 'intake-stapsgewijs':
        return '/scribe/intake-stapsgewijs/klinische-conclusie';
      case 'consult':
        return '/scribe/consult/soep-verslag';
      default:
        return '/scribe';
    }
  }

  /**
   * Get route object by path
   */
  static getRouteByPath(path: string): WorkflowRoute | null {
    return Object.values(WORKFLOW_ROUTES).find(route => route.path === path) || null;
  }

  /**
   * Get route object by workflow and step
   */
  static getRouteByWorkflowAndStep(workflow: WorkflowType, step?: WorkflowStep): WorkflowRoute | null {
    return Object.values(WORKFLOW_ROUTES).find(route =>
      route.workflow === workflow &&
      (step ? route.step === step : !route.step)
    ) || null;
  }

  /**
   * Get all routes for a specific workflow, ordered by step sequence
   */
  static getWorkflowRoutes(workflow: WorkflowType): WorkflowRoute[] {
    const routes = Object.values(WORKFLOW_ROUTES).filter(route => route.workflow === workflow);

    // Define step order for sorting
    const stepOrder: Record<string, number> = {
      'anamnese': 1,
      'onderzoek': 2,
      'klinische-conclusie': 3,
      'conclusie': 4,
      'soep-verslag': 5,
    };

    return routes.sort((a, b) => {
      const aOrder = a.step ? stepOrder[a.step] || 0 : 0;
      const bOrder = b.step ? stepOrder[b.step] || 0 : 0;
      return aOrder - bOrder;
    });
  }

  /**
   * Get the next step in a workflow
   */
  static getNextStep(workflow: WorkflowType, currentStep: WorkflowStep): WorkflowRoute | null {
    const routes = this.getWorkflowRoutes(workflow).filter(route => route.step);
    const currentIndex = routes.findIndex(route => route.step === currentStep);

    if (currentIndex >= 0 && currentIndex < routes.length - 1) {
      return routes[currentIndex + 1];
    }

    return null;
  }

  /**
   * Get the previous step in a workflow
   */
  static getPreviousStep(workflow: WorkflowType, currentStep: WorkflowStep): WorkflowRoute | null {
    const routes = this.getWorkflowRoutes(workflow).filter(route => route.step);
    const currentIndex = routes.findIndex(route => route.step === currentStep);

    if (currentIndex > 0) {
      return routes[currentIndex - 1];
    }

    return null;
  }

  /**
   * Get the first step of a workflow
   */
  static getFirstStep(workflow: WorkflowType): WorkflowRoute | null {
    const routes = this.getWorkflowRoutes(workflow).filter(route => route.step);
    return routes[0] || null;
  }

  /**
   * Get the last step of a workflow
   */
  static getLastStep(workflow: WorkflowType): WorkflowRoute | null {
    const routes = this.getWorkflowRoutes(workflow).filter(route => route.step);
    return routes[routes.length - 1] || null;
  }
}

/**
 * Route validation utilities
 */
export class WorkflowValidator {
  /**
   * Check if a path is a valid workflow route
   */
  static isValidPath(path: string): boolean {
    return Object.values(WORKFLOW_ROUTES).some(route => route.path === path);
  }

  /**
   * Check if a workflow type is valid
   */
  static isValidWorkflow(workflow: string): workflow is WorkflowType {
    return ['intake-automatisch', 'intake-stapsgewijs', 'consult'].includes(workflow);
  }

  /**
   * Check if a step is valid for a specific workflow
   */
  static isValidStepForWorkflow(workflow: WorkflowType, step: string): step is WorkflowStep {
    const workflowRoutes = WorkflowRouter.getWorkflowRoutes(workflow);
    return workflowRoutes.some(route => route.step === step);
  }

  /**
   * Validate if user can access a route based on required data
   */
  static canAccessRoute(route: WorkflowRoute, availableData: Record<string, any>): boolean {
    if (!route.requiresData) return true;

    return route.requiresData.every(dataKey =>
      availableData[dataKey] !== null &&
      availableData[dataKey] !== undefined
    );
  }

  /**
   * Get missing data requirements for a route
   */
  static getMissingRequirements(route: WorkflowRoute, availableData: Record<string, any>): string[] {
    if (!route.requiresData) return [];

    return route.requiresData.filter(dataKey =>
      availableData[dataKey] === null ||
      availableData[dataKey] === undefined
    );
  }

  /**
   * Check if user can proceed to next step in workflow
   */
  static canProceedToNextStep(
    workflow: WorkflowType,
    currentStep: WorkflowStep,
    availableData: Record<string, any>
  ): boolean {
    const nextStep = WorkflowRouter.getNextStep(workflow, currentStep);
    if (!nextStep) return false;

    return this.canAccessRoute(nextStep, availableData);
  }
}

/**
 * Breadcrumb generation utilities
 */
export class BreadcrumbGenerator {
  /**
   * Generate breadcrumbs for current path
   */
  static generateBreadcrumbs(currentPath: string): Array<{ title: string; path: string; isActive: boolean }> {
    const breadcrumbs: Array<{ title: string; path: string; isActive: boolean }> = [];
    const currentRoute = WorkflowRouter.getRouteByPath(currentPath);

    if (!currentRoute) return breadcrumbs;

    // Always start with patient info
    breadcrumbs.push({
      title: 'Patiëntgegevens',
      path: '/scribe',
      isActive: currentPath === '/scribe',
    });

    // Add workflow selection if not on patient info
    if (currentPath !== '/scribe') {
      breadcrumbs.push({
        title: 'Workflow Selectie',
        path: '/scribe/workflow',
        isActive: currentPath === '/scribe/workflow',
      });
    }

    // Add workflow steps
    if (currentPath !== '/scribe' && currentPath !== '/scribe/workflow') {
      const workflowRoutes = WorkflowRouter.getWorkflowRoutes(currentRoute.workflow);
      const stepRoutes = workflowRoutes.filter(route => route.step && route.path !== '/scribe/workflow');

      for (const route of stepRoutes) {
        breadcrumbs.push({
          title: route.title,
          path: route.path,
          isActive: currentPath === route.path,
        });

        // Stop at current route
        if (route.path === currentPath) break;
      }
    }

    return breadcrumbs;
  }
}

/**
 * Progress calculation utilities
 */
export class ProgressCalculator {
  /**
   * Calculate workflow progress percentage
   */
  static calculateProgress(workflow: WorkflowType, currentStep?: WorkflowStep): number {
    const routes = WorkflowRouter.getWorkflowRoutes(workflow).filter(route => route.step);

    if (routes.length === 0) return 100;
    if (!currentStep) return 0;

    const currentIndex = routes.findIndex(route => route.step === currentStep);
    if (currentIndex === -1) return 0;

    return Math.round(((currentIndex + 1) / routes.length) * 100);
  }

  /**
   * Get step position in workflow
   */
  static getStepPosition(workflow: WorkflowType, step: WorkflowStep): { current: number; total: number } {
    const routes = WorkflowRouter.getWorkflowRoutes(workflow).filter(route => route.step);
    const currentIndex = routes.findIndex(route => route.step === step);

    return {
      current: Math.max(0, currentIndex + 1),
      total: routes.length,
    };
  }
}

/**
 * URL pattern matching utilities
 */
export class UrlMatcher {
  /**
   * Extract workflow type from URL path
   */
  static extractWorkflow(path: string): WorkflowType | null {
    if (path.includes('/intake-automatisch')) return 'intake-automatisch';
    if (path.includes('/intake-stapsgewijs')) return 'intake-stapsgewijs';
    if (path.includes('/consult')) return 'consult';
    return null;
  }

  /**
   * Extract step from URL path
   */
  static extractStep(path: string): WorkflowStep | null {
    if (path.includes('/anamnese')) return 'anamnese';
    if (path.includes('/onderzoek')) return 'onderzoek';
    if (path.includes('/klinische-conclusie')) return 'klinische-conclusie';
    if (path.includes('/conclusie')) return 'conclusie';
    if (path.includes('/soep-verslag')) return 'soep-verslag';
    if (path === '/scribe') return 'patient-info';
    if (path === '/scribe/workflow') return 'workflow-selection';
    return null;
  }

  /**
   * Check if URL represents a terminal/final step
   */
  static isTerminalStep(path: string): boolean {
    const route = WorkflowRouter.getRouteByPath(path);
    return route?.isTerminal ?? false;
  }
}

// Export convenience functions for common operations
export const generateWorkflowUrl = WorkflowRouter.generateUrl;
export const generateWorkflowStartUrl = WorkflowRouter.generateWorkflowStartUrl;
export const generateWorkflowEndUrl = WorkflowRouter.generateWorkflowEndUrl;
export const validateWorkflowPath = WorkflowValidator.isValidPath;
export const validateWorkflow = WorkflowValidator.isValidWorkflow;
export const canAccessRoute = WorkflowValidator.canAccessRoute;
export const generateBreadcrumbs = BreadcrumbGenerator.generateBreadcrumbs;
export const calculateProgress = ProgressCalculator.calculateProgress;