export interface CareItem {
  id: string;
  name: string;
  description?: string | null;
  ratings?: Record<string, any> | null;
}

export const compareCareItems = (items: CareItem[]): Record<string, any> => {
  if (!items || items.length < 2) {
    throw new Error('At least two items are required for comparison');
  }

  return items.reduce((acc, item) => {
    const avgRating = item.ratings 
      ? Object.values(item.ratings).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(item.ratings).length 
      : 0;

    acc[item.id] = {
      name: item.name,
      description: item.description,
      averageRating: avgRating,
    };
    return acc;
  }, {});
};