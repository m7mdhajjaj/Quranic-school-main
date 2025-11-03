import NavItem from "./NavItem";
import type { NavigationProps } from "../../types/navigation.types";

const PrimaryNavigation: React.FC<NavigationProps> = ({ items, className = "" }) => {
  return (
    <nav className={`hidden xl:flex items-center gap-2 flex-1 justify-center max-w-3xl ${className}`}>
      {items.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
        />
      ))}
    </nav>
  );
};

export default PrimaryNavigation;