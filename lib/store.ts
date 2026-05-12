"use client";

import { create } from "zustand";
import type {
  Activity,
  ActivityState,
  Assignment,
  Centre,
  Client,
  Comment,
  FeedbackTicket,
  ObserverRequest,
  ObserverRequestStatus,
  PoolEntry,
  Qualification,
  Quarter,
  ResourceAlert,
  RoleView,
  StaffingStatusKind,
  User,
  ValidationKind,
} from "./types";
import {
  CURRENT_QUARTER,
  initialActivities,
  initialCentres,
  initialClients,
  initialComments,
  initialObserverRequests,
  initialPoolEntries,
  initialResourceAlerts,
  initialUsers,
} from "./mock-data";

type DrawerKind =
  | { kind: "activity"; id: string }
  | { kind: "user"; id: string }
  | { kind: "observer-request"; id: string }
  | { kind: "client"; id: string }
  | null;

interface State {
  users: User[];
  clients: Client[];
  centres: Centre[];
  activities: Activity[];
  pool: PoolEntry[];
  observerRequests: ObserverRequest[];
  resourceAlerts: ResourceAlert[];
  comments: Comment[];
  tickets: FeedbackTicket[];

  currentUserId: string;
  roleView: RoleView;
  activeQuarter: Quarter;

  drawer: DrawerKind;
  openDrawer: (d: NonNullable<DrawerKind>) => void;
  closeDrawer: () => void;

  setRoleView: (r: RoleView) => void;
  setCurrentUserId: (id: string) => void;
  setActiveQuarter: (q: Quarter) => void;

  // Activity
  assignUser: (activityId: string, userId: string, days?: number) => void;
  unassignUser: (activityId: string, userId: string) => void;
  setAssignmentDays: (activityId: string, userId: string, days: number) => void;
  setActivityValidation: (activityId: string, v: ValidationKind) => void;
  setActivityStatus: (activityId: string, s: StaffingStatusKind) => void;
  setActivityDates: (
    activityId: string,
    dateStart: string,
    dateEnd: string,
  ) => void;
  requestCancel: (activityId: string) => void;
  duplicateActivity: (activityId: string) => void;
  addOffActivity: (userId: string, start: string, end: string) => void;
  createActivity: (a: Omit<Activity, "id" | "status" | "validation">) => string;

  // Centre
  toggleCentreFormateur: (id: string) => void;
  toggleCentreExterne: (id: string) => void;
  createCentre: (c: Omit<Centre, "id">) => void;

  // Client prévisionnel
  setClientPrevisionnel: (
    id: string,
    patch: Partial<
      Pick<
        Client,
        | "dateBascule"
        | "nbSemainesDeploiement"
        | "estJoursFormation"
        | "estJoursAccomp"
        | "estFormateurs"
        | "estAccompagnateurs"
        | "dateSignaturePrev"
        | "pipeline"
        | "confidence"
      >
    >,
  ) => void;
  shiftClientBlock: (id: string, weeksOffset: number) => void;

  // Pool
  upsertPoolEntry: (entry: Omit<PoolEntry, "id">) => void;
  qualifyPoolEntry: (
    entryId: string,
    qualification: Qualification,
    qualifiedById: string,
    note?: string,
  ) => void;

  // Observer
  addObserverRequest: (
    req: Omit<ObserverRequest, "id" | "createdAt" | "status">,
  ) => void;
  setObserverStatus: (
    id: string,
    status: ObserverRequestStatus,
    assignedActivityId?: string,
  ) => void;

  // Comment
  addComment: (c: Omit<Comment, "id" | "createdAt">) => void;

  // Ticket
  addTicket: (t: Omit<FeedbackTicket, "id" | "createdAt">) => void;
}

// Helpers
export function getAssigneeIds(a: Activity): string[] {
  return a.assignments.map((x) => x.userId);
}

export function activityDurationDays(a: Activity): number {
  return (
    Math.max(
      1,
      Math.round(
        (+new Date(a.dateEnd) - +new Date(a.dateStart)) / 86400000,
      ),
    ) + 1
  );
}

export function computeActivityState(a: Activity): ActivityState {
  if (a.cancelRequested) return "cancel-requested";
  if (a.validation === "ready") return "ready";
  if (a.validation === "validated") return "validated";
  if (a.assignments.length === 0) return "draft";
  if (a.status === "done") return "staffed";
  return "to-staff";
}

export function computeRequired(activity: Activity, centre?: Centre): number {
  if (activity.type === "Formation") return 2;
  if (activity.type === "Off") return 1;
  if (activity.subCategory === "PDS") {
    const n = centre?.nbSalaries ?? 0;
    return Math.max(1, Math.ceil(n / 9 / 1000));
  }
  return 1;
}

function recomputeStatus(
  activity: Activity,
  centre?: Centre,
): StaffingStatusKind {
  if (activity.cancelRequested) return "alert";
  const required = computeRequired(activity, centre);
  if (activity.assignments.length === 0) return "todo";
  if (activity.assignments.length >= required) return "done";
  return "partial";
}

export const useStore = create<State>((set) => ({
  users: initialUsers,
  clients: initialClients,
  centres: initialCentres,
  activities: initialActivities,
  pool: initialPoolEntries,
  observerRequests: initialObserverRequests,
  resourceAlerts: initialResourceAlerts,
  comments: initialComments,
  tickets: [],

  currentUserId: "u1",
  roleView: "manager-deployment",
  activeQuarter: CURRENT_QUARTER,

  drawer: null,
  openDrawer: (d) => set({ drawer: d }),
  closeDrawer: () => set({ drawer: null }),

  setRoleView: (r) => set({ roleView: r }),
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setActiveQuarter: (q) => set({ activeQuarter: q }),

  assignUser: (activityId, userId, days) =>
    set((state) => {
      const activities = state.activities.map((a) => {
        if (a.id !== activityId) return a;
        if (a.assignments.some((x) => x.userId === userId)) return a;
        const user = state.users.find((u) => u.id === userId);
        if (user?.level === "Observateur") {
          const obsCount = a.assignments
            .map((x) => state.users.find((u) => u.id === x.userId))
            .filter((u) => u?.level === "Observateur").length;
          if (obsCount >= 1) return a;
        }
        const fullDays = activityDurationDays(a);
        const newAssignment: Assignment = {
          userId,
          days: days ?? fullDays,
        };
        const next: Activity = {
          ...a,
          assignments: [...a.assignments, newAssignment],
        };
        const client = state.clients.find((c) => c.id === a.clientId);
        if (client) {
          const cdpIds = state.users
            .filter((u) => u.cdpFor?.includes(client.id))
            .map((u) => u.id);
          next.cdpAssigned = next.assignments.some((x) =>
            cdpIds.includes(x.userId),
          );
        }
        const centre = state.centres.find((c) => c.id === a.centreId);
        next.status = recomputeStatus(next, centre);
        return next;
      });
      return { activities };
    }),

  unassignUser: (activityId, userId) =>
    set((state) => {
      const activities = state.activities.map((a) => {
        if (a.id !== activityId) return a;
        const next: Activity = {
          ...a,
          assignments: a.assignments.filter((x) => x.userId !== userId),
        };
        const client = state.clients.find((c) => c.id === a.clientId);
        if (client) {
          const cdpIds = state.users
            .filter((u) => u.cdpFor?.includes(client.id))
            .map((u) => u.id);
          next.cdpAssigned = next.assignments.some((x) =>
            cdpIds.includes(x.userId),
          );
        }
        const centre = state.centres.find((c) => c.id === a.centreId);
        next.status = recomputeStatus(next, centre);
        return next;
      });
      return { activities };
    }),

  setAssignmentDays: (activityId, userId, days) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? {
              ...a,
              assignments: a.assignments.map((x) =>
                x.userId === userId ? { ...x, days: Math.max(1, days) } : x,
              ),
            }
          : a,
      ),
    })),

  setActivityValidation: (activityId, v) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, validation: v } : a,
      ),
    })),

  setActivityStatus: (activityId, s) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, status: s } : a,
      ),
    })),

  setActivityDates: (activityId, dateStart, dateEnd) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, dateStart, dateEnd } : a,
      ),
    })),

  requestCancel: (activityId) =>
    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId
          ? { ...a, cancelRequested: true, status: "alert" }
          : a,
      ),
    })),

  duplicateActivity: (activityId) =>
    set((state) => {
      const src = state.activities.find((a) => a.id === activityId);
      if (!src) return state;
      const copy: Activity = {
        ...src,
        id: `a${state.activities.length + 1}_copy_${Date.now()}`,
        assignments: [],
        status: "todo",
        validation: "prev",
        cancelRequested: false,
      };
      return { activities: [...state.activities, copy] };
    }),

  addOffActivity: (userId, start, end) =>
    set((state) => {
      const off: Activity = {
        id: `a_off_${Date.now()}`,
        type: "Off",
        dateStart: start,
        dateEnd: end,
        assignments: [{ userId, days: 1 }],
        status: "done",
        validation: "validated",
        modality: "Présentiel",
      };
      return { activities: [...state.activities, off] };
    }),

  createActivity: (a) => {
    const id = `a_${Date.now()}`;
    set((state) => ({
      activities: [
        ...state.activities,
        {
          ...a,
          id,
          status: a.assignments.length === 0 ? "todo" : "partial",
          validation: "prev",
        },
      ],
    }));
    return id;
  },

  toggleCentreFormateur: (id) =>
    set((state) => ({
      centres: state.centres.map((c) =>
        c.id === id
          ? {
              ...c,
              isFormateur: !c.isFormateur,
              isExterne: !c.isFormateur ? false : c.isExterne,
            }
          : c,
      ),
    })),

  toggleCentreExterne: (id) =>
    set((state) => ({
      centres: state.centres.map((c) =>
        c.id === id
          ? {
              ...c,
              isExterne: !c.isExterne,
              isFormateur: !c.isExterne ? false : c.isFormateur,
            }
          : c,
      ),
    })),

  createCentre: (c) =>
    set((state) => ({
      centres: [
        ...state.centres,
        { ...c, id: `ce_${Date.now()}` },
      ],
    })),

  setClientPrevisionnel: (id, patch) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  shiftClientBlock: (id, weeksOffset) =>
    set((state) => ({
      clients: state.clients.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c };
        const shiftDate = (iso: string | undefined) =>
          iso
            ? new Date(+new Date(iso) + weeksOffset * 7 * 86400000)
                .toISOString()
                .slice(0, 10)
            : iso;
        next.dateDebut = shiftDate(c.dateDebut)!;
        next.dateFin = shiftDate(c.dateFin)!;
        next.dateBascule = shiftDate(c.dateBascule);
        next.dateSignaturePrev = shiftDate(c.dateSignaturePrev);
        return next;
      }),
    })),

  upsertPoolEntry: (entry) =>
    set((state) => {
      const idx = state.pool.findIndex(
        (e) =>
          e.userId === entry.userId &&
          e.clientId === entry.clientId &&
          e.quarter === entry.quarter,
      );
      if (idx >= 0) {
        const pool = [...state.pool];
        pool[idx] = { ...pool[idx], ...entry, id: pool[idx].id };
        return { pool };
      }
      const id = `p${state.pool.length + 1}_${Date.now()}`;
      return { pool: [...state.pool, { ...entry, id }] };
    }),

  qualifyPoolEntry: (entryId, qualification, qualifiedById, note) =>
    set((state) => ({
      pool: state.pool.map((e) =>
        e.id === entryId
          ? {
              ...e,
              qualification,
              qualifiedById,
              qualifiedAt: new Date().toISOString(),
              note: note ?? e.note,
            }
          : e,
      ),
    })),

  addObserverRequest: (req) =>
    set((state) => ({
      observerRequests: [
        ...state.observerRequests,
        {
          ...req,
          id: `obs${state.observerRequests.length + 1}`,
          status: "submitted",
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  setObserverStatus: (id, status, assignedActivityId) =>
    set((state) => ({
      observerRequests: state.observerRequests.map((r) =>
        r.id === id ? { ...r, status, assignedActivityId } : r,
      ),
    })),

  addComment: (c) =>
    set((state) => ({
      comments: [
        ...state.comments,
        {
          ...c,
          id: `cm${state.comments.length + 1}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  addTicket: (t) =>
    set((state) => ({
      tickets: [
        ...state.tickets,
        {
          ...t,
          id: `t${state.tickets.length + 1}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),
}));

// Permissions
const ROLE_NAV_ACCESS: Record<RoleView, string[]> = {
  admin: ["*"],
  "manager-deployment": [
    "today",
    "previsionnel",
    "clients",
    "centres",
    "formations",
    "formateurs",
    "accompagnements",
    "pools",
    "logistique",
    "equipe",
    "inbox",
    "mon-espace",
    "rapports",
    "stories",
  ],
  "manager-formation": [
    "today",
    "previsionnel",
    "clients",
    "centres",
    "formations",
    "formateurs",
    "accompagnements",
    "pools",
    "equipe",
    "inbox",
    "mon-espace",
    "rapports",
    "stories",
  ],
  ops: ["today", "mon-espace", "inbox"],
  logistique: ["today", "logistique", "inbox"],
};

export function canAccess(role: RoleView, nodeId: string): boolean {
  const list = ROLE_NAV_ACCESS[role];
  if (list.includes("*")) return true;
  return list.includes(nodeId);
}
