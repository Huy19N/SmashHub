export const getRevenueData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { name: 'Tháng 1', actual: 45000000, forecast: 48000000 },
    { name: 'Tháng 2', actual: 38000000, forecast: 40000000 },
    { name: 'Tháng 3', actual: 52000000, forecast: 50000000 },
    { name: 'Tháng 4', actual: 48000000, forecast: 55000000 },
    { name: 'Tháng 5', actual: 61000000, forecast: 60000000 },
    { name: 'Tháng 6', actual: 59000000, forecast: 65000000 },
    { name: 'Tháng 7', actual: 72000000, forecast: 70000000 },
  ];
};

export const getUtilizationData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const data = [];
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const hours = ['06:00', '08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];
  
  days.forEach((day, dayIndex) => {
    hours.forEach((hour, hourIndex) => {
      // Simulate higher utilization in evenings and weekends
      let baseVal = (dayIndex >= 5) ? 60 : 30; // weekend vs weekday
      if (hourIndex >= 4) baseVal += 30; // evening
      
      const value = Math.min(100, Math.max(10, baseVal + (Math.random() * 20 - 10)));
      data.push({
        day,
        hour,
        dayIndex,
        hourIndex,
        value: Math.round(value)
      });
    });
  });
  return data;
};

export const getRetentionData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { month: 'Tháng 1', rate: 100 },
    { month: 'Tháng 2', rate: 85 },
    { month: 'Tháng 3', rate: 76 },
    { month: 'Tháng 4', rate: 65 },
    { month: 'Tháng 5', rate: 60 },
    { month: 'Tháng 6', rate: 58 },
  ];
};
