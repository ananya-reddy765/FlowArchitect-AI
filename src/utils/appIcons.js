import {
  Mail,
  HardDrive,
  MessageSquare,
  FileSpreadsheet,
  Clock,
  FileText,
  CheckSquare,
  Bell,
  Zap,
} from "lucide-react";

const iconMap = {
  Gmail: Mail,
  Email: Mail,
  "Google Drive": HardDrive,
  Slack: MessageSquare,
  "Google Sheets": FileSpreadsheet,
  Schedule: Clock,
  "Report Generator": FileText,
  Form: FileText,
  "Support Form": Bell,
  "Task Manager": CheckSquare,
};

export function getAppIcon(appName) {
  return iconMap[appName] || Zap;
}
