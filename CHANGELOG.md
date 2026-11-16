# 2405 (Countdown & Memories) — Changelog & Architecture Report

## 1. Deep Audit & Bugs Fixed
- **Sửa tên file MP3 tiếng Việt có dấu**: Đã đổi toàn bộ 8 file MP3 tiếng Việt có dấu thành tên ASCII chuẩn web (`bai-nay-chill-phet.mp3`, `cu-chill-thoi.mp3`, v.v.), khắc phục hoàn toàn lỗi giải mã URL (encodeURI/diacritic) gây câm tiếng trên Chrome, Firefox và Safari.
- **Offline Audio Fallback**: Tự động tải nhạc từ file MP3 cục bộ ngay trong thư mục; nếu chạy trên môi trường không có file cục bộ, trình phát sẽ tự động fallback sang URL GitHub raw mà không làm gián đoạn bài hát.
- **Avatar cục bộ dự phòng**: Tích hợp ảnh `1000183171.png` trực tiếp trong thư mục, có fallback mượt mà nếu mất mạng.

---

## 2. Kiến trúc Tái Cấu Trúc (Architecture Refactoring)
Phân tách cấu trúc nguyên khối thành các module độc lập:
```
2405/
├── css/
│   └── style.css            # Toàn bộ theme neon chill, đồng hồ lật 3D, dock nhạc & canvas hiệu ứng
├── js/
│   ├── countdown.js         # Động cơ đếm ngược ngày sinh 24/05, tính tuổi, thời gian thực
│   ├── effects.js           # Pháo hoa Canvas, bóng bay, hạt giấy confetti & cảm ứng thổi nến micro
│   ├── audio-player.js      # Trình phát nhạc nổi 8 bài chill, Playlist Drawer, Volume & Mute dock
│   └── app.js               # Hộp quà bí mật, lưu lời chúc, Chế độ Sinh Nhật thử nghiệm & Init
├── index.html               # File HTML5 ngữ nghĩa, gọn gàng và tương thích cao
└── CHANGELOG.md             # Tài liệu kiểm toán và hướng dẫn sử dụng
```

---

## 3. Cải tiến UI/UX & Hiệu năng
- **Dock nghe nhạc nổi cao cấp**: Hỗ trợ thanh kéo âm lượng (Volume Slider), nút tắt âm (Mute toggle) và thanh tiến trình bài hát.
- **Bắn pháo hoa tương tác khi nhấp chuột**: Nhấp vào bất kỳ đâu trên màn hình nền sẽ bắn ra chùm pháo hoa rực rỡ tại đúng tọa độ đó.

---

## 4. Tính năng mới bổ sung
1. **🎵 Danh Sách Nhạc Nổi (Playlist Drawer)**: Modal danh sách bài hát giúp người nghe dễ dàng chọn và đổi bài yêu thích.
2. **🎂 Chế Độ Sinh Nhật Thử Nghiệm (Preview Mode)**: Nút bật chế độ sinh nhật tức thì trên dock điều khiển để xem pháo hoa rực rỡ và lời chúc mừng mà không cần đợi đến 24/05.
3. **🧭 Nút Master Hub nổi (`hub-pill`)**: Quay về trang trung tâm Bari Hub dễ dàng.