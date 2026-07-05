# Phase 1: Data Model & Contracts

Dữ liệu để render các biểu đồ cần tuân thủ cấu trúc sau (Nếu Backend chưa có, Frontend sẽ tạo Mock Service theo cấu trúc này trong khi chờ BE cập nhật):

## 1. Player Models
### `PlayerProgressData` (Line Chart)
```typescript
interface PlayerProgressData {
  date: string; // "YYYY-MM-DD"
  rating: number; // Điểm Elo
}
```

### `PlayTimeData` (Heatmap / Bar)
```typescript
interface PlayTimeData {
  hourOfDay: number; // 0-23
  dayOfWeek: string; // "Mon", "Tue"...
  matchesCount: number;
}
```

## 2. Court Owner Models
### `RevenueForecastData` (Line Chart)
```typescript
interface RevenueForecastData {
  date: string;
  actualRevenue: number | null; // Null đối với ngày tương lai
  forecastRevenue: number | null; // Dữ liệu dự đoán
}
```

### `UtilizationData` (Heatmap / Bar)
```typescript
interface UtilizationData {
  courtName: string;
  timeSlot: string; // "18:00 - 19:00"
  bookingPercentage: number; // 0.0 -> 1.0 (0-100%)
}
```

## 3. Admin Models
### `PlatformRevenueData` (Area/Bar Chart)
```typescript
interface PlatformRevenueData {
  month: string;
  totalTransactionValue: number;
  platformFeeRevenue: number;
}
```

### `UserGrowthData` (Bar Chart)
```typescript
interface UserGrowthData {
  month: string;
  newPlayers: number;
  newCourtOwners: number;
}
```
