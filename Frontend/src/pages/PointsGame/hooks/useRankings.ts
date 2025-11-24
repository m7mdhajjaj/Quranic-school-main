// hooks/useRankings.ts
import { useState } from "react";
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

  const loadRankings = async () => {
    try {
      setLoading(true);
      const [pointsData, badgesData] = await Promise.all([
        getPointsRankings(),
        getBadgesRankings(),
      ]);
      setRealRankings(pointsData || []);
      setRealBadgeRankings(badgesData || []);
    } catch (error) {
      console.error("خطأ في جلب الترتيبات:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    realRankings,
    realBadgeRankings,
    loadRankings,
  };
};
