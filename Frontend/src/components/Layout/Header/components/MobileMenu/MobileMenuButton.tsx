import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import type { MobileMenuButtonProps } from "../../types/navigation.types";

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="xl:hidden relative p-2.5 rounded-xl bg-gradient-to-br from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white border border-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      title={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-400/0 group-hover:from-emerald-400/20 group-hover:to-teal-400/20 transition-all duration-300" />
      
      {/* Icon with Animation */}
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.3, type: "spring" }}
        className="relative z-10"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </motion.div>

      {/* Pulse Ring */}
      {!isOpen && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-white/30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.button>
  );
};

export default MobileMenuButton;