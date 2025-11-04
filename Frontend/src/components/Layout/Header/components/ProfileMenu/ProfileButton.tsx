import { ChevronDown } from "lucide-react";
import { Button } from "@/components/UI";
import Avatar from "@/components/Avatar/Avatar";
import type { ProfileButtonProps } from "../../types/navigation.types";

const ProfileButton: React.FC<ProfileButtonProps> = ({ user, isOpen, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="md"
      className="gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white hover:scale-105 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200"
      rightIcon={
        <ChevronDown 
          size={isOpen ? 16 : 20} 
          className={`transition-all duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      }
    >
      <div className="flex items-center gap-2">
        <Avatar
          user={user}
          size="sm"
          border="none"
          className="w-8 h-8 md:w-9 md:h-9"
          showStatus={true}
        />
        <span className="hidden md:block text-sm font-semibold truncate max-w-24">
          {user?.firstName || "المستخدم"}
        </span>
      </div>
    </Button>
  );
};

export default ProfileButton;