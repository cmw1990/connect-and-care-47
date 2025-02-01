import apiFetch from '@wordpress/api-fetch';

// Configure the default WordPress API settings
apiFetch.use(apiFetch.createRootURLMiddleware('https://make-life-easier.today/wp-json'));

// Add JWT authentication middleware
apiFetch.use(apiFetch.createNonceMiddleware('your_jwt_token')); // This will need to be updated with actual JWT

// Create type definitions for WordPress responses
export interface WPCareGroup {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  meta: {
    member_count?: number;
  };
}

// API functions
export const wpApi = {
  getCareGroups: async (): Promise<WPCareGroup[]> => {
    try {
      const response = await apiFetch({
        path: '/wp/v2/care-groups',
      });
      return response;
    } catch (error) {
      console.error('Error fetching care groups:', error);
      throw error;
    }
  },

  createCareGroup: async (data: { title: string; content: string }): Promise<WPCareGroup> => {
    try {
      const response = await apiFetch({
        path: '/wp/v2/care-groups',
        method: 'POST',
        data: {
          title: data.title,
          content: data.content,
          status: 'publish',
        },
      });
      return response;
    } catch (error) {
      console.error('Error creating care group:', error);
      throw error;
    }
  },

  getGroupRelations: async (groupId: number): Promise<any> => {
    try {
      const response = await apiFetch({
        path: `/jet-rel/57?post_id=${groupId}`,
      });
      return response;
    } catch (error) {
      console.error('Error fetching group relations:', error);
      throw error;
    }
  },
};