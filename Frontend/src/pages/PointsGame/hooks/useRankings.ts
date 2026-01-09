// hooks/useRankings.ts
import { useCallback, useState } from "react";
import { getPointsRankings, getBadgesRankings } from "@/Api/pointsGameApi";
import type { RankingStudent } from "../types/pointsGame.types";

export const useRankings = () => {
  const [loading, setLoading] = useState(false);
  const [realRankings, setRealRankings] = useState<RankingStudent[]>([]);
  const [realBadgeRankings, setRealBadgeRankings] = useState<RankingStudent[]>(
    []
  );

  const loadRankings = useCallback(async (groupId?: string) => {
    try {
      setLoading(true);
      console.log(
        "🔄 [useRankings] Loading rankings...",
        groupId ? `for group: ${groupId}` : ""
      );
      const [pointsData, badgesData] = await Promise.all([
        getPointsRankings(groupId),
        getBadgesRankings(groupId),
      ]);
      console.log("✅ [useRankings] Points rankings:", pointsData);
      console.log("✅ [useRankings] Badges rankings:", badgesData);
      setRealRankings(pointsData || []);
      setRealBadgeRankings(badgesData || []);
    } catch (error) {
      console.error("❌ [useRankings] Error loading rankings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    realRankings,
    realBadgeRankings,
    loadRankings,
  };
};
