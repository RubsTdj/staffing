export type Role = "Admin" | "Manager" | "OPS" | "Logistique";
export type Team = "Déploiement" | "Formation";
export type Level = "Observateur" | "Junior" | "Senior";

export type Availability = "available" | "backup" | "unavailable";

export type ActivityType = "Formation" | "Accompagnement";
export type SubCategory = "PDS" | "AM" | "IPRP";
export type Modality = "Présentiel" | "Distanciel";

export type StaffingStatusKind = "todo" | "partial" | "done" | "alert";
export type ValidationKind = "prev" | "validated" | "ready";

export interface User {
  id: string;
  name: string;
  initials: string;
  role: Role;
  team: Team;
  level: Level;
  availabilityByClient?: Record<string, Availability>;
}

export interface Client {
  id: string;
  name: string;
  type: "SPSTI" | "Service de santé" | "Autre";
  dateDebut: string; // ISO
  dateFin: string; // ISO
  nbSalaries: number;
}

export interface Centre {
  id: string;
  clientId: string;
  name: string;
  address: string;
  isFormateur: boolean;
  nbSalaries?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subCategory: SubCategory;
  clientId: string;
  centreId: string;
  dateStart: string; // ISO
  dateEnd: string; // ISO
  assignees: string[]; // userIds
  status: StaffingStatusKind;
  validation: ValidationKind;
  modality: Modality;
  cancelRequested?: boolean;
}

export interface FeedbackTicket {
  id: string;
  title: string;
  type: "Idée" | "Bug" | "Question" | "Amélioration";
  priority: "Faible" | "Moyenne" | "Haute" | "Critique";
  description: string;
  attachmentName?: string;
  createdAt: string;
}
