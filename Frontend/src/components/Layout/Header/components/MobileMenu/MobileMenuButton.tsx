import { Menu, X } from "lucide-react";
import { Button } from "@/components/UI/Button";
import type { MobileMenuButtonProps } from "../../types/navigation.types";

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="xl:hidden p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
      title={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
      leftIcon={isOpen ? <X size={22} /> : <Menu size={22} />}
    />
  );
};

export default MobileMenuButton;