export type Role = "ADMIN" | "FLEET_MANAGER" | "DISPATCHER" | "SAFETY_OFFICER" | "FINANCIAL_ANALYST";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  status: "Active" | "Maintenance" | "Out of Service";
  lastMaintenance?: string;
  fuelType?: string;
  currentOdometer?: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: "Available" | "On Trip" | "Off Duty";
}
