
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { usePWA } from "@/contexts/PWAContext";
import { toast } from "sonner";
import NotificationBell from "@/components/ui/notification-bell";

interface PoolHeaderProps {
  onOpenNotifications?: () => void;
}

export function PoolHeader({ onOpenNotifications }: PoolHeaderProps) {
  const { user, logout } = useAuth();
  const { isOnline, canInstall, installPWA } = usePWA();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900">
          Pool Dashboard
        </h1>
        {!isOnline && (
          <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">
            Offline
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {canInstall && (
          <Button variant="outline" size="sm" onClick={installPWA}>
            Install App
          </Button>
        )}
        
        {onOpenNotifications && (
          <NotificationBell onOpenNotifications={onOpenNotifications} />
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
