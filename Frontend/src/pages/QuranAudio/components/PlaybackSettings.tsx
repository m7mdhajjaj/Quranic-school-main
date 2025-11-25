import React, { memo } from "react";
import { Card, Button } from "@/components/UI";
import { Sparkles } from "lucide-react";

interface PlaybackSettingsProps {
  highlightWords: boolean;
  onToggleHighlight: () => void;
}

const PlaybackSettings: React.FC<PlaybackSettingsProps> = memo(({
  highlightWords,
  onToggleHighlight,
}) => {
  return (
    <Card 
      variant="default" 
      padding="md" 
      className="mb-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 transition-colors ${
            highlightWords 
              ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
              : "bg-gray-300"
          }`}>
            <Sparkles className={`w-5 h-5 text-white transition-opacity ${
              highlightWords ? "opacity-100" : "opacity-50"
            }`} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              تمييز الكلمات أثناء القراءة
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {highlightWords 
                ? "سيتم تمييز الكلمات بتأثير متحرك أثناء تشغيل السورة" 
                : "لن يتم تمييز الكلمات أثناء التشغيل"}
            </p>
          </div>
        </div>
        
        <Button
          onClick={onToggleHighlight}
          variant={highlightWords ? "success" : "secondary"}
          size="sm"
          className="flex-shrink-0">
          {highlightWords ? "مفعّل" : "معطّل"}
        </Button>
      </div>
    </Card>
  );
});

PlaybackSettings.displayName = 'PlaybackSettings';

export default PlaybackSettings;
