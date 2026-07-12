import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Fuel,
  LayoutDashboard,
  Map,
  Receipt,
  Truck,
  Users,
  Wrench
} from "lucide-react";
import type { Role } from "../types";

export type ModuleId =
  | "dashboard"
  | "vehicles"
  | "drivers"
  | "trips"
  | "maintenance"
  | "fuel"
  | "expenses"
  | "reports";

export type ModuleAction = "view" | "create" | "edit" | "delete" | "dispatch" | "complete" | "cancel" | "start" | "export";

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
  allowedRoles: Role[];
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  FLEET_MANAGER: "Fleet Manager",
  DISPATCHER: "Dispatcher",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst"
};

export const APP_MODULES: ModuleConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    description: "Fleet overview and performance metrics.",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"]
  },
  {
    id: "vehicles",
    label: "Vehicles",
    path: "/vehicles",
    icon: Truck,
    description: "Manage fleet assets and registrations.",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"]
  },
  {
    id: "drivers",
    label: "Drivers",
    path: "/drivers",
    icon: Users,
    description: "Track driver profiles and safety status.",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"]
  },
  {
    id: "trips",
    label: "Trips",
    path: "/trips",
    icon: Map,
    description: "Dispatch and monitor live routes.",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"]
  },
  {
    id: "maintenance",
    label: "Maintenance",
    path: "/maintenance",
    icon: Wrench,
    description: "Schedule and track maintenance work.",
    allowedRoles: ["ADMIN", "FLEET_MANAGER"]
  },
  {
    id: "fuel",
    label: "Fuel",
    path: "/fuel",
    icon: Fuel,
    description: "Log refuels and consumption data.",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"]
  },
  {
    id: "expenses",
    label: "Expenses",
    path: "/expenses",
    icon: Receipt,
    description: "Review operational spend and costs.",
    allowedRoles: ["ADMIN", "FINANCIAL_ANALYST"]
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    description: "Analyze and export fleet reports.",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"]
  }
];

export const DASHBOARD_SHORTCUTS = APP_MODULES.filter((module) => module.id !== "dashboard");

export const MODULE_ACTION_PERMISSIONS: Record<ModuleId, Record<Exclude<ModuleAction, "view">, Role[]>> = {
  dashboard: {
    create: [],
    edit: [],
    delete: [],
    dispatch: [],
    complete: [],
    cancel: [],
    start: [],
    export: []
  },
  vehicles: {
    create: ["ADMIN", "FLEET_MANAGER"],
    edit: ["ADMIN", "FLEET_MANAGER"],
    delete: ["ADMIN", "FLEET_MANAGER"],
    dispatch: [],
    complete: [],
    cancel: [],
    start: [],
    export: []
  },
  drivers: {
    create: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"],
    edit: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"],
    delete: ["ADMIN", "FLEET_MANAGER"],
    dispatch: [],
    complete: [],
    cancel: [],
    start: [],
    export: []
  },
  trips: {
    create: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
    edit: [],
    delete: [],
    dispatch: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
    complete: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
    cancel: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"],
    start: [],
    export: []
  },
  maintenance: {
    create: ["ADMIN", "FLEET_MANAGER"],
    edit: [],
    delete: ["ADMIN", "FLEET_MANAGER"],
    dispatch: [],
    complete: ["ADMIN", "FLEET_MANAGER"],
    cancel: [],
    start: ["ADMIN", "FLEET_MANAGER"],
    export: []
  },
  fuel: {
    create: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"],
    edit: [],
    delete: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"],
    dispatch: [],
    complete: [],
    cancel: [],
    start: [],
    export: []
  },
  expenses: {
    create: ["ADMIN", "FINANCIAL_ANALYST"],
    edit: ["ADMIN", "FINANCIAL_ANALYST"],
    delete: ["ADMIN", "FINANCIAL_ANALYST"],
    dispatch: [],
    complete: [],
    cancel: [],
    start: [],
    export: []
  },
  reports: {
    create: [],
    edit: [],
    delete: [],
    dispatch: [],
    complete: [],
    cancel: [],
    start: [],
    export: ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"]
  }
};

export const hasModuleAccess = (role: Role | null | undefined, moduleId: ModuleId) => {
  if (!role) {
    return false;
  }

  return APP_MODULES.find((module) => module.id === moduleId)?.allowedRoles.includes(role) ?? false;
};

export const hasActionAccess = (
  role: Role | null | undefined,
  moduleId: ModuleId,
  action: Exclude<ModuleAction, "view">
) => {
  if (!role) {
    return false;
  }

  return MODULE_ACTION_PERMISSIONS[moduleId][action].includes(role);
};

export const getAccessibleModules = (role: Role | null | undefined) => {
  return APP_MODULES.filter((module) => hasModuleAccess(role, module.id));
};

export const getAccessibleDashboardShortcuts = (role: Role | null | undefined) => {
  return DASHBOARD_SHORTCUTS.filter((module) => hasModuleAccess(role, module.id));
};

export const getDefaultRoute = (role: Role | null | undefined) => {
  return getAccessibleModules(role)[0]?.path || "/login";
};
