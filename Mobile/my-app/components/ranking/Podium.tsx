/**
 * Podium Component
 * Olympic-style podium for top 3 students
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { PodiumProps } from "@/types/ranking.types";
import { getFullName, getMedalColor } from "@/utils/rankingHelpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const Podium: React.FC<PodiumProps> = ({ topThreeStudents }) => {
  const renderPodiumPlace = (
    student: (typeof topThreeStudents)[0],
    rank: number,
    height: number
  ) => {
    const medalColor = getMedalColor(rank);

    return (
      <View style={[styles.placeContainer, { flex: rank === 1 ? 1.2 : 1 }]}>
        {/* Medal Circle */}
        <View style={[styles.medalCircle, { borderColor: medalColor }]}>
          <Text style={[styles.rankNumber, { color: medalColor }]}>{rank}</Text>
          <View style={[styles.medalBadge, { backgroundColor: medalColor }]}>
            <Text style={styles.badgeText}>{rank}</Text>
          </View>
          {rank === 1 && (
            <View style={styles.starContainer}>
              <MaterialCommunityIcons
                name="star"
                size={24}
                color={medalColor}
              />
            </View>
          )}
        </View>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          <Text
            style={[styles.studentName, rank === 1 && styles.firstPlaceName]}
            numberOfLines={1}>
            {getFullName(student)}
          </Text>
          <Text
            style={[styles.average, rank === 1 && styles.firstPlaceAverage]}>
            {student.overallAverage.toFixed(1)}%
          </Text>
        </View>

        {/* Podium Block */}
        <View
          style={[
            styles.podiumBlock,
            {
              height,
              backgroundColor: medalColor,
            },
          ]}>
          <Text style={styles.podiumRank}>{rank}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.podiumRow}>
        {/* Second place */}
        {topThreeStudents[1] && renderPodiumPlace(topThreeStudents[1], 2, 120)}

        {/* First place */}
        {topThreeStudents[0] && renderPodiumPlace(topThreeStudents[0], 1, 160)}

        {/* Third place */}
        {topThreeStudents[2] && renderPodiumPlace(topThreeStudents[2], 3, 100)}
      </View>

      {/* Base gradient */}
      <LinearGradient
        colors={["#10B981", "#14B8A6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.base}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginVertical: 20,
  },
  podiumRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    minHeight: 300,
    marginBottom: 16,
    gap: 8,
  },
  placeContainer: {
    alignItems: "center",
  },
  medalCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rankNumber: {
    fontSize: 32,
    fontWeight: "bold",
  },
  medalBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  starContainer: {
    position: "absolute",
    top: -24,
  },
  studentInfo: {
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  firstPlaceName: {
    fontSize: 16,
    fontWeight: "700",
  },
  average: {
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  firstPlaceAverage: {
    fontSize: 15,
    fontWeight: "700",
  },
  podiumBlock: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  podiumRank: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  base: {
    height: 16,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
