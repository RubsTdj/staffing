"use client";

import { create } from "zustand";
import type {
  Activity,
  ActivityState,
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
  assignUser: (activityId: string, userId: string) => void;
  unassignUser: (activityId: string, userId: string) => void;
  setActivityValidation: (activityId: string, v: ValidationKind) => void;
  setActivityStatus: (activityId: string, s: StaffingStatusKind) => void;
  requestCancel: (activityId: string) => void;
  duplicateActivity: (activityId: string) => void;
  addOffActivity: (userId: string, start: string, end: string) => void;

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
  addComment: (
    c: Omit<Comment, "id" | "createdAt">,
  ) => void;

  // Ticket
  addTicket: (t: Omit<FeedbackTicket, "id" | "createdAt">) => void;
}

// Composite état affiché en UI (1 seul badge)
export function computeActivityState(a: Activity): ActivityState {
  if (a.cancelRequested) return "cancel-requested";
  if (a.validation === "ready") return "ready";
  if (a.validation === "validated") return "validated";
  if (a.assignees.length === 0) return "draft";
  if (a.status === "done") return "staffed";
  return "to-staff";
}

export function computeRequired(activity: Activity, centre?: Centre): number {
  if (activity.type === "Formation") return 2; // règle par défaut CR
  if (activity.type === "Off") return 1;
  // Accompagnement PDS: 1 / 9 salariés
  if (activity.subCategory === "PDS") {
    const n = centre?.nbSalaries ?? 9;
    return Math.max(1, Math.ceil(n / 9 / 1000)); // n en milliers → /9k
  }
  return 1;
}

function recomputeStatus(
  activity: Activity,
  centre?: Centre,
): StaffingStatusKind {
  if (activity.cancelRequested) return "alert";
  const required = computeRequired(activity, centre);
  if (activity.assignees.length === 0) return "todo";
  if (activity.assignees.length >= required) return "done";
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

  currentUserId: "u1", // Camille par défaut
  roleView: "manager-deployment",
  activeQuarter: CURRENT_QUARTER,

  drawer: null,
  openDrawer: (d) => set({ drawer: d }),
  closeDrawer: () => set({ drawer: null }),

  setRoleView: (r) => set({ roleView: r }),
  setCurrentUserId: (id) => set({ currentUserId: id }),
  setActiveQuarter: (q) => set({ activeQuarter: q }),

  assignUser: (activityId, userId) =>
    set((state) => {
      const activities = state.activities.map((a) => {
        if (a.id !== activityId) return a;
        if (a.assignees.includes(userId)) return a;
        const user = state.users.find((u) => u.id === userId);
        if (user?.level === "Observateur") {
          const obsCount = a.assignees
            .map((id) => state.users.find((u) => u.id === id))
            .filter((u) => u?.level === "Observateur").length;
          if (obsCount >= 1) return a;
        }
        const next: Activity = { ...a, assignees: [...a.assignees, userId] };
        // dérive cdpAssigned
        const client = state.clients.find((c) => c.id === a.clientId);
        if (client) {
          const cdpIds = state.users
            .filter((u) => u.cdpFor?.includes(client.id))
            .map((u) => u.id);
          next.cdpAssigned = next.assignees.some((id) => cdpIds.includes(id));
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
          assignees: a.assignees.filter((id) => id !== userId),
        };
        const client = state.clients.find((c) => c.id === a.clientId);
        if (client) {
          const cdpIds = state.users
            .filter((u) => u.cdpFor?.includes(client.id))
            .map((u) => u.id);
          next.cdpAssigned = next.assignees.some((id) => cdpIds.includes(id));
        }
        const centre = state.centres.find((c) => c.id === a.centreId);
        next.status = recomputeStatus(next, centre);
        return next;
      });
      return { activities };
    }),

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
        id: `a${state.activities.length + 1}_copy`,
        assignees: [],
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
        assignees: [userId],
        status: "done",
        validation: "validated",
        modality: "Présentiel",
      };
      return { activities: [...state.activities, off] };
    }),

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
