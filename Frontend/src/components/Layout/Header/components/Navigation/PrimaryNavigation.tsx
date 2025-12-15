import NavItem from "./NavItem";
import MoreDropdown from "./MoreDropdown";
import type { NavigationProps } from "../../types/navigation.types";

const PrimaryNavigation: React.FC<NavigationProps> = ({ items, className = "" }) => {
  // Show first 5 items, rest in "More" dropdown
  const maxVisibleItems = 5;
  const visibleItems = items.slice(0, maxVisibleItems);
  const moreItems = items.slice(maxVisibleItems);

  return (
    <nav className={`hidden xl:flex items-center gap-1.5 flex-1 justify-center max-w-4xl ${className}`}>
      {visibleItems.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          className="px-3 py-2 rounded-lg text-xs font-semibold"
        />
      ))}
      {moreItems.length > 0 && <MoreDropdown items={moreItems} />}
    </nav>
  );
};

export default PrimaryNavigation;