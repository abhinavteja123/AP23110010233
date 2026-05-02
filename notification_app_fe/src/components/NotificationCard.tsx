import { Card, CardContent, Chip, Stack, Typography, Box } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import type { Notification, NotifType } from "@/lib/types";

// pick a chip color per type so users can scan the feed
const typeColor: Record<NotifType, "primary" | "warning" | "info"> = {
  Placement: "primary",
  Result: "warning",
  Event: "info",
};

function relativeTime(ts: string): string {
  const t = new Date(ts.replace(" ", "T")).getTime();
  const diff = Math.max(0, Date.now() - t);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  notification: Notification;
  isNew: boolean;
  onClick?: () => void;
}

export default function NotificationCard({ notification, isNew, onClick }: Props) {
  const { Type, Message, Timestamp, ID } = notification;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderLeft: 4,
        borderColor: isNew ? "secondary.main" : "transparent",
        opacity: isNew ? 1 : 0.75,
        transition: "all 0.15s ease",
        "&:hover": onClick ? { boxShadow: 3 } : {},
      }}
    >
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Chip
            label={Type}
            size="small"
            color={typeColor[Type]}
            sx={{ fontWeight: 600 }}
          />
          {isNew && (
            <FiberManualRecordIcon
              sx={{ fontSize: 10, color: "secondary.main" }}
              titleAccess="new"
            />
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {relativeTime(Timestamp)}
          </Typography>
        </Stack>
        <Typography
          variant="body1"
          sx={{ fontWeight: isNew ? 600 : 400 }}
        >
          {Message}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {Timestamp} · ID {ID.slice(0, 8)}
        </Typography>
      </CardContent>
    </Card>
  );
}
