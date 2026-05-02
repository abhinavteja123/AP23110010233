// shape of a single notification coming from the API

export type NotifType = "Event" | "Result" | "Placement";

export interface Notification {
  ID: string;
  Type: NotifType;
  Message: string;
  Timestamp: string; // ISO-ish "YYYY-MM-DD HH:mm:ss"
}

export interface NotificationsResponse {
  notifications: Notification[];
}
