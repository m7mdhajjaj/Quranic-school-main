import { Search } from 'lucide-react';
import { Input } from "@/components/UI";
import type { SearchBarProps } from "@/types/searchBar";

const SearchBar = ({
  value,
  onChange,
  placeholder = "ابحث عن سورة بالاسم أو الرقم...",
}: SearchBarProps) => {
  return (
    <div className="w-full md:flex-1">
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        rightIcon={<Search size={20} className="text-emerald-600" />}
        className="text-right shadow-md border-2 border-emerald-200 focus:border-emerald-400 transition-colors"
      />
    </div>
  );
};

export default SearchBar;
