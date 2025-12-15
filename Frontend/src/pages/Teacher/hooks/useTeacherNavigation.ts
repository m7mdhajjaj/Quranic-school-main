import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useTeacherNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedGroupId = searchParams.get("groupId");
  const selectedGroupName = searchParams.get("groupName") || "";
  const viewMode = selectedGroupId ? "students" : "groups";

  const navigateToGroup = useCallback((groupId: string, groupName: string) => {
    setSearchParams({ groupId, groupName });
  }, [setSearchParams]);

  const navigateToGroups = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return {
    selectedGroupId,
    selectedGroupName,
    viewMode,
    navigateToGroup,
    navigateToGroups,
  };
};
