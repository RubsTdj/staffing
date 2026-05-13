import type {
  Activity,
  Centre,
  Client,
  Comment,
  DeploymentWave,
  ObserverRequest,
  PoolEntry,
  Quarter,
  ResourceAlert,
  User,
  WaveCell,
} from "./types";

export const CURRENT_QUARTER: Quarter = "2026-Q2";
export const TODAY = "2026-05-12";

export const initialUsers: User[] = [
  // Formation
  {
    id: "u1",
    name: "Alice Martin",
    initials: "AM",
    role: "Manager",
    team: "Formation",
    level: "Senior",
    monthlyTripCapacity: 8,
  },
  {
    id: "u2",
    name: "Bruno Lefèvre",
    initials: "BL",
    role: "OPS",
    team: "Formation",
    level: "Senior",
    monthlyTripCapacity: 10,
  },
  {
    id: "u3",
    name: "Chloé Bernard",
    initials: "CB",
    role: "OPS",
    team: "Formation",
    level: "Junior",
    monthlyTripCapacity: 8,
  },
  // Déploiement
  {
    id: "u4",
    name: "David Dupont",
    initials: "DD",
    role: "Manager",
    team: "Déploiement",
    level: "Senior",
    cdpFor: ["c1"],
    monthlyTripCapacity: 6,
  },
  {
    id: "u5",
    name: "Émilie Petit",
    initials: "EP",
    role: "OPS",
    team: "Déploiement",
    level: "Senior",
    cdpFor: ["c2"],
    monthlyTripCapacity: 8,
  },
  {
    id: "u6",
    name: "François Robert",
    initials: "FR",
    role: "OPS",
    team: "Déploiement",
    level: "Junior",
    monthlyTripCapacity: 6,
  },
  // RM (Run / Resource Management)
  {
    id: "u7",
    name: "Gabrielle Thomas",
    initials: "GT",
    role: "OPS",
    team: "RM",
    level: "Senior",
    monthlyTripCapacity: 5,
  },
  {
    id: "u8",
    name: "Hugo Durand",
    initials: "HD",
    role: "OPS",
    team: "RM",
    level: "Junior",
    monthlyTripCapacity: 4,
  },
  // EFEX
  {
    id: "u9",
    name: "Iris Moreau",
    initials: "IM",
    role: "OPS",
    team: "EFEX",
    level: "Senior",
    monthlyTripCapacity: 6,
  },
  {
    id: "u10",
    name: "Julien Simon",
    initials: "JS",
    role: "Admin",
    team: "Déploiement",
    level: "Senior",
  },
  // Produits (designers / devs)
  {
    id: "u11",
    name: "Karine Michel",
    initials: "KM",
    role: "OPS",
    team: "Produits",
    level: "Observateur",
    monthlyTripCapacity: 3,
  },
  // Intégration
  {
    id: "u12",
    name: "Laurent Garcia",
    initials: "LG",
    role: "OPS",
    team: "Intégration",
    level: "Senior",
    monthlyTripCapacity: 5,
  },
  // Logistique (rôle, équipe rattachée Déploiement)
  {
    id: "u13",
    name: "Marie Roux",
    initials: "MR",
    role: "Logistique",
    team: "Déploiement",
    level: "Senior",
  },
];

export const initialClients: Client[] = [
  {
    id: "c1",
    name: "McDonald's France",
    kind: "SPSTI",
    pipeline: "signed",
    dateDebut: "2026-04-06",
    dateFin: "2026-07-31",
    nbSalaries: 142000,
    estFormateurs: 5,
    estSemainesFormation: 5,
    estAccompagnateurs: 13,
    estJoursFormation: 100,
    estJoursAccomp: 142,
    dateBascule: "2026-05-19",
    nbSemainesDeploiement: 17,
    dateSignaturePrev: "2025-11-15",
    confidence: 100,
    tlDeploymentId: "u1",
    prevOwnerId: "u12",
  },
  {
    id: "c2",
    name: "Uber EMEA",
    kind: "SPSTI",
    pipeline: "signed",
    dateDebut: "2026-05-04",
    dateFin: "2026-09-12",
    nbSalaries: 89000,
    estFormateurs: 4,
    estSemainesFormation: 4,
    estAccompagnateurs: 10,
    estJoursFormation: 64,
    estJoursAccomp: 89,
    dateBascule: "2026-06-16",
    nbSemainesDeploiement: 19,
    dateSignaturePrev: "2025-12-10",
    confidence: 100,
    tlDeploymentId: "u5",
    prevOwnerId: "u12",
  },
  {
    id: "c3",
    name: "Apple Retail",
    kind: "Autonome",
    pipeline: "verbal",
    dateDebut: "2026-09-01",
    dateFin: "2027-04-30",
    nbSalaries: 210000,
    estFormateurs: 8,
    estSemainesFormation: 8,
    estAccompagnateurs: 22,
    estJoursFormation: 200,
    estJoursAccomp: 210,
    dateBascule: "2026-10-13",
    nbSemainesDeploiement: 26,
    dateSignaturePrev: "2026-04-15",
    confidence: 75,
    tlDeploymentId: "u1",
    prevOwnerId: "u12",
  },
  {
    id: "c4",
    name: "Hermès Production",
    kind: "SPSTI",
    pipeline: "intent",
    dateDebut: "2026-10-13",
    dateFin: "2027-02-26",
    nbSalaries: 56000,
    estFormateurs: 3,
    estSemainesFormation: 3,
    estAccompagnateurs: 6,
    estJoursFormation: 50,
    estJoursAccomp: 56,
    dateBascule: "2026-11-17",
    nbSemainesDeploiement: 19,
    dateSignaturePrev: "2026-06-30",
    confidence: 50,
    prevOwnerId: "u12",
  },
  {
    id: "c5",
    name: "Carrefour Hyper",
    kind: "SPSTI",
    pipeline: "suspect",
    dateDebut: "2027-01-12",
    dateFin: "2027-06-15",
    nbSalaries: 78000,
    estFormateurs: 3,
    estSemainesFormation: 3,
    estAccompagnateurs: 8,
    estJoursFormation: 60,
    estJoursAccomp: 78,
    dateBascule: "2027-02-09",
    nbSemainesDeploiement: 22,
    dateSignaturePrev: "2026-09-30",
    confidence: 25,
    prevOwnerId: "u12",
  },
];

export const initialCentres: Centre[] = [
  {
    id: "ce1",
    clientId: "c1",
    name: "Site Rennes",
    address: "12 av. de la Bouvardière, 35000 Rennes",
    region: "Bretagne",
    isFormateur: true,
    nbSalaries: 38000,
  },
  {
    id: "ce2",
    clientId: "c1",
    name: "Site Saint-Malo",
    address: "4 rue du Port, 35400 Saint-Malo",
    region: "Bretagne",
    isFormateur: false,
    isExterne: false,
    nbSalaries: 22000,
  },
  {
    id: "ce3",
    clientId: "c1",
    name: "Site Fougères",
    address: "ZA La Galaisière, 35300 Fougères",
    region: "Bretagne",
    isFormateur: false,
    isExterne: true,
    nbSalaries: 18000,
  },
  {
    id: "ce4",
    clientId: "c2",
    name: "Site Avignon",
    address: "rue Pierre Seghers, 84000 Avignon",
    region: "PACA",
    isFormateur: true,
    nbSalaries: 31000,
  },
  {
    id: "ce5",
    clientId: "c2",
    name: "Site Carpentras",
    address: "av. Jean Henri Fabre, 84200 Carpentras",
    region: "PACA",
    isFormateur: false,
    nbSalaries: 27000,
  },
  {
    id: "ce6",
    clientId: "c3",
    name: "Site Bordeaux",
    address: "Esplanade Charles de Gaulle, 33300 Bordeaux",
    region: "Nouvelle-Aquitaine",
    isFormateur: true,
    nbSalaries: 65000,
  },
  {
    id: "ce7",
    clientId: "c3",
    name: "Site Pau",
    address: "bd des Pyrénées, 64000 Pau",
    region: "Nouvelle-Aquitaine",
    isFormateur: false,
    nbSalaries: 41000,
  },
  {
    id: "ce8",
    clientId: "c4",
    name: "Site Montigny",
    address: "av. de la Vague, 78180 Montigny-le-Bretonneux",
    region: "IDF",
    isFormateur: true,
    nbSalaries: 30000,
  },
];

export const initialActivities: Activity[] = [
  {
    id: "a1",
    type: "Accompagnement",
    subCategory: "PDS",
    clientId: "c1",
    centreId: "ce1",
    dateStart: "2026-05-19T09:00:00",
    dateEnd: "2026-05-21T17:30:00",
    assignments: [
      { userId: "u2", days: 3 },
      { userId: "u3", days: 2 },
    ],
    status: "partial",
    validation: "prev",
    modality: "Présentiel",
    cdpAssigned: false,
  },
  {
    id: "a2",
    type: "Accompagnement",
    subCategory: "AM",
    clientId: "c1",
    centreId: "ce2",
    dateStart: "2026-05-26T09:00:00",
    dateEnd: "2026-05-28T17:30:00",
    assignments: [],
    status: "todo",
    validation: "prev",
    modality: "Présentiel",
  },
  {
    id: "a3",
    type: "Accompagnement",
    subCategory: "PDS",
    clientId: "c1",
    centreId: "ce3",
    dateStart: "2026-06-02T09:00:00",
    dateEnd: "2026-06-04T17:30:00",
    assignments: [
      { userId: "u5", days: 3 },
      { userId: "u3", days: 3 },
      { userId: "u1", days: 1 },
    ],
    status: "done",
    validation: "validated",
    modality: "Présentiel",
    cdpAssigned: true,
  },
  {
    id: "a4",
    type: "Formation",
    clientId: "c1",
    centreId: "ce1",
    dateStart: "2026-05-12T09:00:00",
    dateEnd: "2026-05-12T17:00:00",
    assignments: [
      { userId: "u2", days: 1 },
      { userId: "u3", days: 1 },
    ],
    status: "done",
    validation: "ready",
    modality: "Présentiel",
    formateurReferentId: "u2",
  },
  {
    id: "a5",
    type: "Accompagnement",
    subCategory: "IPRP",
    clientId: "c2",
    centreId: "ce4",
    dateStart: "2026-05-19T09:00:00",
    dateEnd: "2026-05-21T17:30:00",
    assignments: [{ userId: "u2", days: 3 }],
    status: "partial",
    validation: "prev",
    modality: "Présentiel",
  },
  {
    id: "a6",
    type: "Accompagnement",
    subCategory: "AM",
    clientId: "c2",
    centreId: "ce5",
    dateStart: "2026-05-26T09:00:00",
    dateEnd: "2026-05-28T17:30:00",
    assignments: [
      { userId: "u5", days: 3 },
      { userId: "u9", days: 2 },
      { userId: "u4", days: 1 },
    ],
    status: "alert",
    validation: "prev",
    modality: "Distanciel",
    cancelRequested: true,
  },
  {
    id: "a7",
    type: "Accompagnement",
    subCategory: "PDS",
    clientId: "c2",
    centreId: "ce4",
    dateStart: "2026-06-09T09:00:00",
    dateEnd: "2026-06-11T17:30:00",
    assignments: [
      { userId: "u3", days: 3 },
      { userId: "u5", days: 3 },
      { userId: "u9", days: 2 },
      { userId: "u7", days: 1 },
    ],
    status: "done",
    validation: "validated",
    modality: "Présentiel",
    cdpAssigned: true,
  },
  {
    id: "a8",
    type: "Off",
    dateStart: "2026-05-25T00:00:00",
    dateEnd: "2026-05-27T23:59:00",
    assignments: [{ userId: "u3", days: 3 }],
    status: "done",
    validation: "validated",
    modality: "Présentiel",
  },
];

// Pools — entrées de TLs/Managers OPS, certaines déjà qualifiées par le Manager Déploiement
export const initialPoolEntries: PoolEntry[] = [
  // c1 — équipe pour Q2 2026
  {
    id: "p1",
    userId: "u2",
    clientId: "c1",
    quarter: "2026-Q2",
    filledById: "u5",
    selfDeclared: false,
    rawAvailability: "available",
    qualification: "available",
    qualifiedById: "u11",
    qualifiedAt: "2026-04-08",
  },
  {
    id: "p2",
    userId: "u3",
    clientId: "c1",
    quarter: "2026-Q2",
    filledById: "u5",
    selfDeclared: false,
    rawAvailability: "available",
    qualification: "available",
    qualifiedById: "u11",
    qualifiedAt: "2026-04-08",
  },
  {
    id: "p3",
    userId: "u4",
    clientId: "c1",
    quarter: "2026-Q2",
    filledById: "u5",
    selfDeclared: false,
    rawAvailability: "backup",
    qualification: null, // à qualifier
  },
  {
    id: "p4",
    userId: "u7",
    clientId: "c1",
    quarter: "2026-Q2",
    filledById: "u5",
    selfDeclared: false,
    rawAvailability: "available",
    qualification: "backup",
    qualifiedById: "u11",
    qualifiedAt: "2026-04-10",
    note: "Disponible mais déjà 6 trips en cours — Backup",
  },
  {
    id: "p5",
    userId: "u9",
    clientId: "c1",
    quarter: "2026-Q2",
    filledById: "u5",
    selfDeclared: false,
    rawAvailability: "available",
    qualification: null,
  },
  // c2
  {
    id: "p6",
    userId: "u2",
    clientId: "c2",
    quarter: "2026-Q2",
    filledById: "u1",
    selfDeclared: false,
    rawAvailability: "backup",
    qualification: "backup",
    qualifiedById: "u11",
    qualifiedAt: "2026-04-12",
  },
  {
    id: "p7",
    userId: "u5",
    clientId: "c2",
    quarter: "2026-Q2",
    filledById: "u1",
    selfDeclared: false,
    rawAvailability: "available",
    qualification: "available",
    qualifiedById: "u11",
    qualifiedAt: "2026-04-12",
  },
  {
    id: "p8",
    userId: "u9",
    clientId: "c2",
    quarter: "2026-Q2",
    filledById: "u1",
    selfDeclared: false,
    rawAvailability: "available",
    qualification: null,
  },
  {
    id: "p9",
    userId: "u3",
    clientId: "c2",
    quarter: "2026-Q2",
    filledById: "u1",
    selfDeclared: false,
    rawAvailability: "unavailable",
    qualification: null,
  },
];

export const initialObserverRequests: ObserverRequest[] = [
  {
    id: "obs1",
    requesterId: "u_ext1",
    requesterName: "Nina Schmidt",
    requesterTeam: "Produit",
    managerId: "u11",
    reason:
      "Découvrir un déploiement terrain pour mieux cadrer la roadmap produit côté SPSTI.",
    preferredPeriodStart: "2026-06-01",
    preferredPeriodEnd: "2026-06-15",
    durationDays: 1,
    status: "submitted",
    createdAt: "2026-05-10T09:32:00",
  },
  {
    id: "obs2",
    requesterId: "u_ext2",
    requesterName: "Olivier Dubois",
    requesterTeam: "Sales",
    managerId: "u11",
    reason:
      "Comprendre le déroulé client pour mieux pitcher les futurs SPSTI signés.",
    preferredPeriodStart: "2026-06-15",
    preferredPeriodEnd: "2026-06-30",
    durationDays: 1,
    status: "reviewed",
    createdAt: "2026-05-08T15:20:00",
  },
  {
    id: "obs3",
    requesterId: "u7",
    requesterName: "Gabrielle Thomas",
    requesterTeam: "OPS",
    managerId: "u5",
    reason: "Montée en compétences sur l'accompagnement Autonome.",
    preferredPeriodStart: "2026-06-01",
    preferredPeriodEnd: "2026-06-30",
    durationDays: 3,
    status: "submitted",
    createdAt: "2026-05-11T10:00:00",
  },
];

export const initialResourceAlerts: ResourceAlert[] = [
  {
    id: "ra1",
    quarter: "2026-Q3",
    clientId: "c3",
    type: "accompagnateur",
    shortfall: 4,
    createdAt: "2026-05-11T08:00:00",
    resolved: false,
  },
];

export const initialComments: Comment[] = [
  {
    id: "cm1",
    activityId: "a3",
    authorId: "u11",
    body: "Bien noté pour le passage Senior + CDP, on garde Chloé en doublure.",
    mentions: ["u1"],
    createdAt: "2026-05-09T11:20:00",
  },
];

export const TICKET_TYPES = ["Idée", "Bug", "Question", "Amélioration"] as const;
export const TICKET_PRIORITIES = [
  "Faible",
  "Moyenne",
  "Haute",
  "Critique",
] as const;

export const OBSERVER_TEAMS = [
  "OPS",
  "Produit",
  "Sales",
  "Finance",
  "Autre",
] as const;

// ============================================================
//  Vagues de déploiement (timeline prévisionnel)
// ============================================================

// Helper : génère une séquence de cellules.
// `pattern` = array de tokens lus dans l'ordre :
//   "S"   → déploiement actif (bleu, S01… auto-numéroté)
//   "KO"  → kick-off
//   "F:n" → formation rose clair avec n personnes
//   "A:n" → accompagnement rose foncé avec n personnes
//   "_"   → pause (gris)
function wave(
  id: string,
  clientId: string,
  startMonday: string,
  pattern: string[],
  note?: string,
): DeploymentWave {
  const cells: WaveCell[] = pattern.map((tok) => {
    if (tok === "KO") return { kind: "ko" };
    if (tok === "_") return { kind: "pause" };
    if (tok === "S") return { kind: "deploy" };
    if (tok.startsWith("F:")) {
      return { kind: "formation", headcount: Number(tok.slice(2)) };
    }
    if (tok.startsWith("A:")) {
      return { kind: "accompagnement", headcount: Number(tok.slice(2)) };
    }
    return { kind: "deploy" };
  });
  return { id, clientId, startMonday, cells, note };
}

export const initialWaves: DeploymentWave[] = [
  // McDonald's France — déjà en cours
  wave(
    "w1",
    "c1",
    "2026-03-30",
    [
      "S", "S", "S", "S", "S", "S", "KO",
      "F:8", "F:8", "_", "_",
      "A:20", "A:18", "A:15", "A:12", "A:10", "A:8",
    ],
    "Déplt lundi 19/05 (mardi habituel décalé jour férié)",
  ),
  // Uber EMEA — démarre bientôt
  wave(
    "w2",
    "c2",
    "2026-04-27",
    [
      "S", "S", "S", "S", "S", "S", "S", "KO",
      "F:6", "F:6", "F:14",
      "A:12", "A:10", "A:8", "A:6", "A:4",
    ],
    "Avec un observateur OPS sur semaine 3",
  ),
  // Apple Retail — démarre en juin
  wave(
    "w3",
    "c3",
    "2026-05-25",
    [
      "S", "S", "S", "S", "S",
      "KO",
      "F:4", "F:4", "_",
      "A:8", "A:8", "A:8", "A:6", "A:6", "A:4",
    ],
  ),
  // Hermès Production — démarre en juillet
  wave(
    "w4",
    "c4",
    "2026-06-15",
    [
      "S", "S", "S",
      "KO",
      "F:6", "F:6", "F:6",
      "A:12", "A:10", "A:8",
    ],
  ),
];
