export type NotifType = "Event" | "Result" | "Placement";

export interface Notification {
  ID: string;
  Type: NotifType;
  Message: string;
  Timestamp: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}
