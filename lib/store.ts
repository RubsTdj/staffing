"use client";

import { create } from "zustand";
import type {
  Activity,
  Centre,
  Client,
  FeedbackTicket,
  StaffingStatusKind,
  User,
  ValidationKind,
} from "./types";
import {
  initialActivities,
  initialCentres,
  initialClients,
  initialUsers,
} from "./mock-data";

type DrawerKind =
  | { kind: "activity"; id: string }
  | { kind: "user"; id: string }
  | null;

interface State {
  users: User[];
  clients: Client[];
  centres: Centre[];
  activities: Activity[];
  tickets: FeedbackTicket[];
  drawer: DrawerKind;
  openDrawer: (d: NonNullable<DrawerKind>) => void;
  closeDrawer: () => void;

  // Activity mutations
  assignUser: (activityId: string, userId: string) => void;
  unassignUser: (activityId: string, userId: string) => void;
  setActivityValidation: (activityId: string, v: ValidationKind) => void;
  setActivityStatus: (activityId: string, s: StaffingStatusKind) => void;
  requestCancel: (activityId: string) => void;

  // Tickets
  addTicket: (t: Omit<FeedbackTicket, "id" | "createdAt">) => void;
}

function recomputeStatus(activity: Activity, centre?: Centre): StaffingStatusKind {
  if (activity.cancelRequested) return "alert";
  const required = computeRequired(activity, centre);
  if (activity.assignees.length === 0) return "todo";
  if (activity.assignees.length >= required) return "done";
  return "partial";
}

export function computeRequired(activity: Activity, centre?: Centre): number {
  // PDS: 1 accompagnant pour 9 salariés
  if (activity.subCategory === "PDS") {
    const n = centre?.nbSalaries ?? 9;
    return Math.max(1, Math.ceil(n / 9));
  }
  // AM / IPRP : règle simplifiée — 1 par défaut
  return 1;
}

export const useStore = create<State>((set) => ({
  users: initialUsers,
  clients: initialClients,
  centres: initialCentres,
  activities: initialActivities,
  tickets: [],
  drawer: null,
  openDrawer: (d) => set({ drawer: d }),
  closeDrawer: () => set({ drawer: null }),

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
          if (obsCount >= 1) return a; // hard block — handled by UI alert too
        }
        const next: Activity = { ...a, assignees: [...a.assignees, userId] };
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
