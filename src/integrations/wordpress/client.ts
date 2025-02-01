import apiFetch from '@wordpress/api-fetch';

// Configure the default WordPress API settings
apiFetch.use(apiFetch.createRootURLMiddleware('https://make-life-easier.today/wp-json'));

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
      console.log('Fetching care groups from WordPress...');
      const response = await apiFetch<WPCareGroup[]>({
        path: '/wp/v2/care-groups',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Care groups response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching care groups:', error);
      throw error;
    }
  },

  createCareGroup: async (data: { title: string; content: string }): Promise<WPCareGroup> => {
    try {
      console.log('Creating care group:', data);
      const response = await apiFetch<WPCareGroup>({
        path: '/wp/v2/care-groups',
        method: 'POST',
        data: {
          title: data.title,
          content: data.content,
          status: 'publish',
        },
      });
      console.log('Create care group response:', response);
      return response;
    } catch (error) {
      console.error('Error creating care group:', error);
      throw error;
    }
  },

  getGroupRelations: async (groupId: number): Promise<any> => {
    try {
      console.log('Fetching group relations for ID:', groupId);
      const response = await apiFetch({
        path: `/jet-rel/57?post_id=${groupId}`,
      });
      console.log('Group relations response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching group relations:', error);
      throw error;
    }
  },
};