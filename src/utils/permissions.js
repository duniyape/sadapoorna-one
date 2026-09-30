/**
 * Central Permission System — Single Source of Truth
 * Import usePermissions() wherever module visibility needs to be checked.
 * All module IDs that are ALWAYS visible (no role restrictions) are listed here.
 */

export const ALWAYS_ALLOWED_IDS = new Set([
  // Navigation
  'home',
]);

/**
 * @param {object} user - The logged-in user object from DashboardLayout
 * @returns {{ isAllowed: (item: {id: string}) => boolean }}
 */
export function usePermissions(user) {
  const allowedIcons =
    user?.access?.frontend_icons ||
    user?.designation?.frontend_icons ||
    [];

  const isAllowed = (item) => {
    if (!user) return false;
    if (ALWAYS_ALLOWED_IDS.has(item.id)) return true;
    return allowedIcons.some((iconData) => {
      if (typeof iconData === 'string') return iconData === item.id;
      if (typeof iconData === 'object') return iconData.icon === item.id;
      return false;
    });
  };

  const hasActionPermission = (moduleId, actionName) => {
    if (!user) return false;
    
    const modulePerm = allowedIcons.find((iconData) => {
      if (typeof iconData === 'object') return iconData.icon === moduleId;
      return false;
    });
    
    if (!modulePerm || !Array.isArray(modulePerm.buttons)) {
      return false;
    }
    
    return modulePerm.buttons.includes(actionName);
  };

  return { isAllowed, hasActionPermission };
}
