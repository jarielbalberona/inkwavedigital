import type { User } from "./IUserRepository.js";

export interface IVenueStaffRepository {
  /**
   * Get all venue IDs assigned to a user (optionally filtered by role)
   */
  getVenuesByUserId(userId: string, role?: string): Promise<string[]>;

  /**
   * Get all users assigned to a venue (optionally filtered by role)
   */
  getUsersByVenueId(venueId: string, role?: string): Promise<User[]>;

  /**
   * Assign a user to a venue with a specific role
   */
  assignStaffToVenue(userId: string, venueId: string, role: string): Promise<void>;

  /**
   * Remove a user from a venue
   */
  removeStaffFromVenue(userId: string, venueId: string): Promise<void>;

  /**
   * Update the role of a user at a venue
   */
  updateStaffRole(userId: string, venueId: string, role: string): Promise<void>;

  /**
   * Check if a user has access to a venue
   */
  hasAccessToVenue(userId: string, venueId: string): Promise<boolean>;

  /**
   * Get all venues a user can access based on their role
   */
  getAccessibleVenues(userId: string, tenantId: string, userRole: string): Promise<string[]>;
}

