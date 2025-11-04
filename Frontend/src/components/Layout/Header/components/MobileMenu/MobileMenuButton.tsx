import { Menu, X } from "lucide-react";
import { Button } from "@/components/UI/Button";
import type { MobileMenuButtonProps } from "../../types/navigation.types";

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="xl:hidden p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white border-none"
      title={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
      leftIcon={isOpen ? <X size={20} /> : <Menu size={20} />}
    />
  );
};

export default MobileMenuButton;