export type Role = "Admin" | "Manager" | "OPS" | "Logistique";
export type Team =
  | "Formation"
  | "Déploiement"
  | "RM"
  | "EFEX"
  | "Produits"
  | "Intégration";
export type Level = "Observateur" | "Junior" | "Senior";

export const ALL_TEAMS: Team[] = [
  "Formation",
  "Déploiement",
  "RM",
  "EFEX",
  "Produits",
  "Intégration",
];

export type Availability = "available" | "backup" | "unavailable";
export type Qualification = "available" | "backup" | null;

export type ActivityType = "Formation" | "Accompagnement" | "Off";
export type SubCategory = "PDS" | "AM" | "IPRP";
export type Modality = "Présentiel" | "Distanciel";

export type ClientPipeline = "signed" | "verbal" | "intent" | "suspect";
export type ClientKind = "SPSTI" | "Autonome" | "Service de santé" | "Autre";

export type StaffingStatusKind = "todo" | "partial" | "done" | "alert";
export type ValidationKind = "prev" | "validated" | "ready";

// Composite état affiché à l'écran (1 seul badge — remplace l'affichage à 2 emojis)
export type ActivityState =
  | "draft"             // rien, pas d'assignés
  | "to-staff"          // partiellement staffé
  | "staffed"           // tous les slots OK, pas validé manager
  | "validated"         // staffing validé par manager
  | "ready"             // logistique OK, prêt au départ
  | "cancel-requested"; // alerte annulation

export type Region =
  | "IDF"
  | "Bretagne"
  | "PACA"
  | "Nouvelle-Aquitaine"
  | "Auvergne-Rhône-Alpes"
  | "Hauts-de-France"
  | "Grand Est"
  | "Occitanie"
  | "Normandie"
  | "Centre-Val de Loire"
  | "Pays de la Loire"
  | "Bourgogne-Franche-Comté"
  | "Corse";

export interface User {
  id: string;
  name: string;
  initials: string;
  role: Role;
  team: Team;
  level: Level;
  cdpFor?: string[]; // clientIds dont cet user est CDP
  monthlyTripCapacity?: number; // pour l'équité / surcharge
}

export interface Assignment {
  userId: string;
  days: number; // durée effective de présence (peut être < durée totale de l'activité)
}

export interface Client {
  id: string;
  name: string;
  kind: ClientKind;
  pipeline: ClientPipeline;
  dateDebut: string;
  dateFin: string;
  nbSalaries: number;
  // Estimés du moteur (cf. CR planification)
  estFormateurs?: number;
  estSemainesFormation?: number;
  estAccompagnateurs?: number;
  // Prévisionnel (CR pipeline)
  dateSignaturePrev?: string;     // date estimée de signature
  nbSemainesDeploiement?: number; // durée totale du déploiement
  dateBascule?: string;            // J0 cutover (mardi)
  estJoursFormation?: number;      // nb de jours-homme formation
  estJoursAccomp?: number;         // nb de jours-homme accomp
  confidence?: number;             // 0-100 pour pipeline
  // Manager Référent / TL Déploiement
  tlDeploymentId?: string;
  // Personne responsable du prévisionnel pour ce client
  prevOwnerId?: string;
}

export interface Centre {
  id: string;
  clientId: string;
  name: string;
  address: string;
  region: Region;
  isFormateur: boolean;
  isExterne?: boolean; // centre externe (loué, hors locaux client) — mutuellement exclusif avec isFormateur
  nbSalaries?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subCategory?: SubCategory;
  clientId?: string;
  centreId?: string;
  dateStart: string;
  dateEnd: string;
  // Assignements riches : durée par personne
  assignments: Assignment[];
  status: StaffingStatusKind;
  validation: ValidationKind;
  modality: Modality;
  cancelRequested?: boolean;
  isVeille?: boolean;
  isExternalResource?: boolean;
  cdpAssigned?: boolean;
  formateurReferentId?: string;
}

export type FeedbackKind = "Idée" | "Bug" | "Question" | "Amélioration";
export type FeedbackPriority = "Faible" | "Moyenne" | "Haute" | "Critique";

export interface FeedbackTicket {
  id: string;
  title: string;
  type: FeedbackKind;
  priority: FeedbackPriority;
  description: string;
  attachmentName?: string;
  createdAt: string;
}

export type Quarter = `${number}-Q${1 | 2 | 3 | 4}`;

export interface PoolEntry {
  id: string;
  userId: string;
  clientId: string;
  quarter: Quarter;
  filledById: string; // TL/Manager OPS qui a renseigné
  selfDeclared: boolean;
  rawAvailability: Availability;
  qualification: Qualification; // posée par le Manager Déploiement
  qualifiedById?: string;
  qualifiedAt?: string;
  note?: string;
}

export type ObserverTeam = "OPS" | "Produit" | "Sales" | "Finance" | "Autre";
export type ObserverRequestStatus =
  | "submitted"
  | "reviewed"
  | "assigned"
  | "rejected";

export interface ObserverRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterTeam: ObserverTeam;
  managerId: string;
  reason: string;
  preferredPeriodStart?: string;
  preferredPeriodEnd?: string;
  durationDays: number; // 3 OPS / 1 autres par défaut
  status: ObserverRequestStatus;
  assignedActivityId?: string;
  createdAt: string;
}

export interface ResourceAlert {
  id: string;
  quarter: Quarter;
  clientId: string;
  type: "formateur" | "accompagnateur";
  shortfall: number;
  createdAt: string;
  resolved: boolean;
}

export interface Comment {
  id: string;
  activityId: string;
  authorId: string;
  body: string;
  mentions: string[];
  createdAt: string;
}

// Pour la simulation de rôle dans l'app
export type RoleView =
  | "manager-formation"
  | "manager-deployment"
  | "ops"
  | "logistique"
  | "admin";
