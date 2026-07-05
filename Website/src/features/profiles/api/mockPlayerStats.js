export const getPlayerProgressData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { date: 'Jan', rating: 1200 },
    { date: 'Feb', rating: 1250 },
    { date: 'Mar', rating: 1240 },
    { date: 'Apr', rating: 1300 },
    { date: 'May', rating: 1350 },
    { date: 'Jun', rating: 1400 },
    { date: 'Jul', rating: 1420 },
  ];
};

export const getPlayTimeData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { name: 'Thứ 2', matches: 2 },
    { name: 'Thứ 3', matches: 1 },
    { name: 'Thứ 4', matches: 4 },
    { name: 'Thứ 5', matches: 0 },
    { name: 'Thứ 6', matches: 5 },
    { name: 'Thứ 7', matches: 8 },
    { name: 'CN', matches: 6 },
  ];
};

export const getOpponentData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { name: 'Thắng', value: 15, color: 'hsl(var(--primary))' },
    { name: 'Thua', value: 10, color: 'hsl(var(--destructive))' },
    { name: 'Hòa', value: 2, color: 'hsl(var(--muted-foreground))' },
  ];
};
