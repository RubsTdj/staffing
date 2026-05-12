export type StoryPriority = "P0" | "P1" | "P2";
export type StoryStatus =
  | "done"
  | "in-progress"
  | "next"
  | "later";

export interface UserStory {
  id: string;
  persona: string;
  as: string; // "En tant que ..."
  want: string; // "je veux ..."
  so: string; // "afin de ..."
  priority: StoryPriority;
  status: StoryStatus;
  source: string; // CR / interview
  notes?: string;
}

export const STORIES: UserStory[] = [
  // —— Manager Formation (Siméon) ——
  {
    id: "S-01",
    persona: "Manager Formation",
    as: "Manager Formation",
    want:
      "voir le prévisionnel des signatures à M-6/M-5 alimenté par Julie",
    so: "piloter le staffing trimestriel sans changer d'outil",
    priority: "P0",
    status: "in-progress",
    source: "Process · Phase 1",
  },
  {
    id: "S-02",
    persona: "Manager Formation",
    as: "Manager Formation",
    want:
      "estimer les besoins formation et accompagnement par client à M-5",
    so: "déclencher l'alerte ressources externes si l'équipe est insuffisante",
    priority: "P0",
    status: "next",
    source: "Process · Phase 1",
  },
  {
    id: "S-03",
    persona: "Manager Formation",
    as: "Manager Formation",
    want:
      "voir une alerte automatique quand le pool qualifié couvre moins que l'estimation",
    so: "alerter Manager Déploiement et les Managers OPS dans la foulée",
    priority: "P0",
    status: "done",
    source: "Process · Phase 1 (diamond)",
  },

  // —— Julie (Sales prévisionnel) ——
  {
    id: "S-04",
    persona: "Julie",
    as: "Julie",
    want:
      "importer / saisir le prévisionnel des signatures avec niveau de confiance",
    so: "que les Managers voient l'impact des clients potentiels (jaune/orange)",
    priority: "P1",
    status: "later",
    source: "CR planification",
  },

  // —— Manager Déploiement (Clara) ——
  {
    id: "S-05",
    persona: "Manager Déploiement",
    as: "Manager Déploiement (Clara)",
    want: "lancer le rituel trimestriel de constitution du pool",
    so: "donner aux TLs un point de départ clair",
    priority: "P0",
    status: "done",
    source: "Process · Phase 2",
  },
  {
    id: "S-06",
    persona: "Manager Déploiement",
    as: "Manager Déploiement (Clara)",
    want:
      "qualifier chaque entrée du pool en Dispo / Backup / Indispo, avec note",
    so: "que May et les managers travaillent sur des candidats fiables",
    priority: "P0",
    status: "done",
    source: "Process · Phase 2",
  },
  {
    id: "S-07",
    persona: "Manager Déploiement",
    as: "Manager Déploiement (Clara)",
    want: "centraliser les demandes d'observation soumises par les managers",
    so: "affecter les observateurs aux déplacements et appliquer la règle 1/déplacement",
    priority: "P0",
    status: "done",
    source: "Process · Sous-flux Observateurs",
  },
  {
    id: "S-08",
    persona: "Manager Déploiement",
    as: "Manager Déploiement",
    want:
      "voir si le CDP est bien staffé sur l'accompagnement d'un client dont il est CDP",
    so: "respecter la règle 'CDP minimum'",
    priority: "P0",
    status: "done",
    source: "Process · Phase 2",
  },

  // —— Manager OPS / TL ——
  {
    id: "S-09",
    persona: "Manager OPS / TL",
    as: "TL / Manager OPS",
    want:
      "renseigner pour chaque trimestre la dispo des collaborateurs de mon équipe",
    so: "que Clara puisse les qualifier sans devoir les demander un par un",
    priority: "P0",
    status: "done",
    source: "Process · Phase 2",
  },
  {
    id: "S-10",
    persona: "Manager OPS / TL",
    as: "TL / Manager",
    want:
      "soumettre une demande d'observation pour un de mes collaborateurs via un formulaire intégré",
    so: "centraliser la demande au lieu de passer par Slack",
    priority: "P0",
    status: "done",
    source: "Process · Sous-flux Observateurs",
  },

  // —— Collaborateur OPS ——
  {
    id: "S-11",
    persona: "Collaborateur OPS",
    as: "OPS terrain",
    want:
      "voir ma quinzaine en un écran : missions, lieu, période, type, équipe, client",
    so: "ne plus chercher dans Slack ou Google Sheets",
    priority: "P0",
    status: "done",
    source: "CR objectifs",
  },
  {
    id: "S-12",
    persona: "Collaborateur OPS",
    as: "OPS",
    want: "déclarer mes indispos via le type d'activité Off",
    so: "que mon manager n'ait pas à le saisir pour moi",
    priority: "P0",
    status: "done",
    source: "CR améliorations UI",
  },
  {
    id: "S-13",
    persona: "Collaborateur OPS",
    as: "OPS",
    want: "accéder aux documents de mon déplacement (KIT, plan d'accès, contact)",
    so: "arriver préparé sur le terrain",
    priority: "P1",
    status: "in-progress",
    source: "CR objectifs",
  },
  {
    id: "S-14",
    persona: "Collaborateur OPS",
    as: "OPS",
    want: "voir mon équité de déplacements vs. ma capacité",
    so: "comprendre ma charge et la défendre auprès de mon manager",
    priority: "P1",
    status: "in-progress",
    source: "CR objectifs · KPIs",
  },

  // —— Logistique (May) ——
  {
    id: "S-15",
    persona: "Logistique",
    as: "May",
    want:
      "voir uniquement les missions au statut Staffing Validé sous forme de cartes",
    so: "ne plus dépendre d'un fichier Excel transmis manuellement",
    priority: "P0",
    status: "done",
    source: "Process · Phase 3",
  },
  {
    id: "S-16",
    persona: "Logistique",
    as: "May",
    want:
      "voir un train aller suggéré (veille, jamais dimanche) et le nb de nuits",
    so: "réserver plus vite avec moins d'erreurs",
    priority: "P0",
    status: "done",
    source: "Process · Phase 3 + règle déplacement",
  },
  {
    id: "S-17",
    persona: "Logistique",
    as: "May",
    want:
      "marquer une mission comme Prêt au départ une fois trains et hôtels réservés",
    so: "que les OPS voient leur agenda à jour",
    priority: "P0",
    status: "done",
    source: "Process · Phase 3",
  },
  {
    id: "S-18",
    persona: "Logistique",
    as: "May",
    want:
      "pousser automatiquement les événements Google Calendar des participants",
    so: "supprimer l'étape manuelle d'invitation",
    priority: "P1",
    status: "next",
    source: "Process · Phase 3",
  },

  // —— Admin / Rubens / Siméon ——
  {
    id: "S-19",
    persona: "Admin",
    as: "Admin / Rubens",
    want: "importer la reprise de données 2026 depuis un CSV",
    so: "démarrer la phase de test sept-déc 2026 avec un jeu propre",
    priority: "P0",
    status: "later",
    source: "CR · reprise de données",
  },
  {
    id: "S-20",
    persona: "Admin",
    as: "Admin",
    want:
      "paramétrer les règles de calcul (4,4,11 / 1 j-h pour 1000 / etc.)",
    so: "ajuster sans toucher au code",
    priority: "P1",
    status: "later",
    source: "CR planification",
  },
  {
    id: "S-21",
    persona: "Admin",
    as: "Siméon",
    want:
      "exporter le rapport trimestriel 'prime de déplacement' en CSV (jours terrain, trips mutualisés, IDF exclu, veille 0.5j)",
    so: "alimenter la paie sans retraitement manuel",
    priority: "P0",
    status: "next",
    source: "CR · reporting trimestriel",
  },
  {
    id: "S-22",
    persona: "Admin",
    as: "Siméon",
    want:
      "voir un dashboard d'équité : déplacements/personne, balance Manager vs Formateur",
    so: "préserver l'équilibre de l'équipe",
    priority: "P1",
    status: "in-progress",
    source: "CR · objectifs KPIs",
  },

  // —— Transversaux ——
  {
    id: "S-23",
    persona: "Transversal",
    as: "tout utilisateur créant une activité",
    want: "le champ client devient obligatoire et filtre les centres dispo",
    so: "ne plus choisir un centre du mauvais client",
    priority: "P0",
    status: "in-progress",
    source: "CR · bug fix",
  },
  {
    id: "S-24",
    persona: "Transversal",
    as: "tout utilisateur créant une Formation",
    want: "voir uniquement les centres marqués 'formateur' (2 sur 30 pour PST35)",
    so: "éviter les sélections incorrectes",
    priority: "P0",
    status: "in-progress",
    source: "CR · bug fix",
  },
  {
    id: "S-25",
    persona: "Transversal",
    as: "tout utilisateur",
    want:
      "voir un seul badge État composite (○ ◐ ● ✓ 🚆 ✕) au lieu de 2 emojis",
    so: "comprendre l'état d'une mission en un coup d'œil",
    priority: "P0",
    status: "done",
    source: "CR · UI",
  },
  {
    id: "S-26",
    persona: "Transversal",
    as: "Manager / Clara",
    want:
      "commenter une activité avec mentions @ pour échanger entre managers / formateurs",
    so: "garder les échanges au bon endroit",
    priority: "P1",
    status: "done",
    source: "CR · UI",
  },
  {
    id: "S-27",
    persona: "Transversal",
    as: "tout utilisateur",
    want: "dupliquer une mission par double-clic / bouton dédié",
    so: "créer rapidement des séquences répétitives",
    priority: "P1",
    status: "done",
    source: "CR · UI",
  },
  {
    id: "S-28",
    persona: "Transversal",
    as: "Manager",
    want:
      "consulter un calendrier type Google Agenda en plus de la Timeline",
    so: "consulter facilement, surtout pour les formateurs",
    priority: "P1",
    status: "next",
    source: "CR · UI",
  },
  {
    id: "S-29",
    persona: "Transversal",
    as: "Manager",
    want:
      "voir les samedis et dimanches sur la Timeline (visibles, non grisés)",
    so: "lire la semaine sans ambiguïté",
    priority: "P1",
    status: "next",
    source: "CR · UI",
  },
];

export const PERSONAS = [
  "Manager Formation",
  "Manager Déploiement",
  "Manager OPS / TL",
  "Collaborateur OPS",
  "Logistique",
  "Julie",
  "Admin",
  "Transversal",
] as const;

export const STATUS_LABEL: Record<StoryStatus, string> = {
  done: "Livré",
  "in-progress": "En cours",
  next: "Prochain sprint",
  later: "Plus tard",
};
