export const getPlatformRevenueData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { month: 'Tháng 1', revenue: 12500000 },
    { month: 'Tháng 2', revenue: 18200000 },
    { month: 'Tháng 3', revenue: 15400000 },
    { month: 'Tháng 4', revenue: 22000000 },
    { month: 'Tháng 5', revenue: 28500000 },
    { month: 'Tháng 6', revenue: 35000000 },
  ];
};

export const getUserGrowthData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { month: 'T1', newUsers: 120, churnedUsers: 10 },
    { month: 'T2', newUsers: 150, churnedUsers: 15 },
    { month: 'T3', newUsers: 180, churnedUsers: 12 },
    { month: 'T4', newUsers: 220, churnedUsers: 20 },
    { month: 'T5', newUsers: 300, churnedUsers: 25 },
    { month: 'T6', newUsers: 350, churnedUsers: 30 },
  ];
};

export const getRoleDistributionData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { name: 'Player (Người chơi)', value: 850, color: 'hsl(var(--primary))' },
    { name: 'Court Owner (Chủ sân)', value: 120, color: 'hsl(var(--chart-2, 210, 100%, 50%))' },
    { name: 'Admin', value: 5, color: 'hsl(var(--chart-3, 30, 100%, 50%))' },
  ];
};
