// hooks/useRankings.ts
import { useCallback, useState } from "react";
import {
  getPointsRankings,
  getBadgesRankings,
} from "@/Api/pointsGameApi";
import type { RankingStudent } from "../types/pointsGame.types";

export const useRankings = () => {
  const [loading, setLoading] = useState(false);
  const [realRankings, setRealRankings] = useState<RankingStudent[]>([]);
  const [realBadgeRankings, setRealBadgeRankings] = useState<RankingStudent[]>(
    []
  );

  const loadRankings = useCallback(async () => {
    try {
      setLoading(true);
      const [pointsData, badgesData] = await Promise.all([
        getPointsRankings(),
        getBadgesRankings(),
      ]);
      setRealRankings(pointsData || []);
      setRealBadgeRankings(badgesData || []);
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
