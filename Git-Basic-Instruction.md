# ISD.VN.20242-23

## Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt và thiết lập](#cài-đặt-và-thiết-lập)
3. [Các khái niệm cơ bản](#các-khái-niệm-cơ-bản)
4. [Quy trình làm việc cơ bản](#quy-trình-làm-việc-cơ-bản)
5. [Làm việc với nhánh (Branches)](#làm-việc-với-nhánh-branches)
6. [Xử lý xung đột (Conflicts)](#xử-lý-xung-đột-conflicts)
7. [Thực hành tốt](#thực-hành-tốt)
8. [Tài nguyên học tập thêm](#tài-nguyên-học-tập-thêm)

## Giới thiệu

GitHub là một nền tảng lưu trữ mã nguồn và quản lý phiên bản phổ biến, sử dụng hệ thống Git. Hướng dẫn này sẽ giúp bạn bắt đầu sử dụng GitHub một cách hiệu quả trong dự án của mình.

## Cài đặt và thiết lập

1. **Tạo tài khoản GitHub**: Truy cập [github.com](https://github.com) và đăng ký tài khoản mới.

2. **Cài đặt Git**: 
   - Windows: Tải và cài đặt từ [git-scm.com](https://git-scm.com)
   - macOS: Cài đặt thông qua Homebrew bằng lệnh `brew install git`
   - Linux: Sử dụng trình quản lý gói của bạn, ví dụ: `sudo apt-get install git`

3. **Cấu hình Git**:
   Mở terminal hoặc command prompt và chạy:
   ```
   git config --global user.name "Tên của bạn"
   git config --global user.email "email@example.com"
   ```

## Các khái niệm cơ bản

- **Repository (Repo)**: Nơi lưu trữ toàn bộ lịch sử và các phiên bản của dự án.
- **Commit**: Một bản ghi các thay đổi trong repo.
- **Branch**: Một phiên bản độc lập của repo, cho phép phát triển song song.
- **Pull Request (PR)**: Đề xuất merge các thay đổi từ một branch vào một branch khác.
- **Fork**: Bản sao của một repo, thường được sử dụng để đóng góp vào dự án của người khác.

## Quy trình làm việc cơ bản

1. **Clone repository**:
   ```
   git clone https://github.com/mrbad12e/Nhom20.Web.git
   ```

2. **Kiểm tra trạng thái**:
   ```
   git status
   ```

3. **Thêm các thay đổi**:
   ```
   git add filename
   ```
   hoặc thêm tất cả:
   ```
   git add .
   ```

4. **Commit các thay đổi**:
   ```
   git commit -m "Mô tả ngắn gọn về thay đổi"
   ```

5. **Push lên GitHub**:
   ```
   git push origin main
   ```

## Làm việc với nhánh (Branches)

1. **Tạo nhánh mới**:
   ```
   git branch ten-nhanh-moi
   ```

2. **Chuyển sang nhánh mới**:
   ```
   git checkout ten-nhanh-moi
   ```
   hoặc tạo và chuyển sang nhánh mới cùng lúc:
   ```
   git checkout -b ten-nhanh-moi
   ```

3. **Merge nhánh**:
   ```
   git checkout main
   git merge ten-nhanh-moi
   ```

## Xử lý xung đột (Conflicts)

Khi có xung đột, Git sẽ đánh dấu trong file. Mở file, giải quyết xung đột, sau đó:

1. **Thêm file đã giải quyết xung đột**:
   ```
   git add ten-file-xung-dot
   ```

2. **Hoàn tất merge**:
   ```
   git commit
   ```

## Thực hành tốt

1. **Commit thường xuyên**: Tạo các commit nhỏ, tập trung vào một thay đổi cụ thể.
2. **Viết mô tả commit rõ ràng**: Mô tả ngắn gọn nhưng đầy đủ về những gì đã thay đổi và tại sao.
3. **Sử dụng branches**: Tạo branch mới cho mỗi tính năng hoặc sửa lỗi.
4. **Review code**: Sử dụng Pull Requests để review code trước khi merge.
5. **Cập nhật thường xuyên**: Pull các thay đổi mới nhất từ repo chính thường xuyên.

## Tài nguyên học tập thêm

- [GitHub Guides](https://guides.github.com/)
- [Git Book](https://git-scm.com/book/en/v2)
- [GitHub Learning Lab](https://lab.github.com/)
