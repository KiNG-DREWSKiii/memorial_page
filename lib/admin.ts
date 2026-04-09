import { adminKey } from "@/lib/config";

export function hasAdminAccess(request: Request) {
  const headerKey = request.headers.get("x-admin-key");
  return headerKey === adminKey;
}
