import axiosInstance from '../api/axios';

/**
 * Service for Resident Invitation and Registration API endpoints.
 */
export const residentService = {
  /**
   * Validate invitation token on page load
   * GET /api/resident/validate?token=<token>
   * 
   * @param {string} token - The invitation token extracted from URL query params
   * @returns {Promise<Object>} Resident data (residentName, email)
   */
  validateToken: async (token) => {
    const response = await axiosInstance.get(`/api/resident/validate?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  /**
   * Register resident with valid token and password
   * POST /api/resident/register
   * Body: { token, password }
   * 
   * @param {string} token - Invitation token
   * @param {string} password - User's chosen password
   * @returns {Promise<Object>} Response confirmation message
   */
  registerResident: async (token, password) => {
    const response = await axiosInstance.post('/api/resident/register', {
      token,
      password,
    });
    return response.data;
  },

  /**
   * Community Admin invites a resident
   * POST /api/community/invite-resident
   * Body: { residentName, email }
   * 
   * @param {string} residentName - Full name of the resident
   * @param {string} email - Email address of the resident
   * @returns {Promise<Object>} Invitation details ({ message, token, invitationLink })
   */
  inviteResident: async (residentName, email) => {
    const response = await axiosInstance.post('/api/community/invite-resident', {
      residentName,
      email,
    });
    return response.data;
  },
};

export default residentService;
