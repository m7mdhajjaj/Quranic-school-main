import React from 'react';
import { X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static lg:h-auto lg:shadow-none lg:bg-transparent
      `}>
        <div className="p-4 flex justify-between items-center lg:hidden">
          <h2 className="font-bold text-lg text-gray-800">القائمة</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-gray-500 text-center text-sm">Sidebar Content</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
