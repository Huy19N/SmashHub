# API Interface Contracts

Tính năng này sử dụng API hiện hữu của hệ thống Backend, ứng dụng Android đóng vai trò Consumer.

## POST `/api/schedules/{scheduleId}/calculate-split-bill`

Endpoint để thực hiện chốt chia tiền và lưu vào hệ thống.

**Request Body (Chế độ Custom)**:
```json
{
  "extraFee": 150000.0,
  "extraFeeNote": "Tiền 1 thùng nước và 2 ống cầu",
  "fixedAmountPerPerson": null,
  "customAmounts": {
    "00000000-0000-0000-0000-000000000001": 50000.0,
    "00000000-0000-0000-0000-000000000002": 30000.0,
    "...": 0.0
  }
}
```

*Lưu ý*: Giá trị trong `customAmounts` được tính toán trên Frontend bằng `(Tổng tiền mong muốn của User) - (Tổng ExtraFee / Số lượng User)` để đảm bảo sau khi Backend chạy qua hàm `p.CostToPay = request.CustomAmounts[p.UserId] + extra`, thì `p.CostToPay` sẽ khớp hoàn toàn với `Tổng tiền mong muốn của User`.
