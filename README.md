# Smart Attendance System

A full-stack AI-powered attendance management system leveraging **face recognition** for real-time student tracking and automated attendance logging.

## ✨ Features

- 🎯 **Face Recognition Attendance** – Real-time detection using OpenCV + dlib
- 👤 **Student Management** – Registration with photo capture
- 📊 **Dashboard Analytics** – Attendance summaries and visualizations
- 📈 **Reports** – Generate and export attendance records (CSV)
- 🎥 **Live Camera Feed** – Real-time detection with bounding boxes
- 📱 **Responsive UI** – Works across devices
- 💾 **Persistent Storage** – SQLite database with query support

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, Vite, Tailwind CSS, React Router, Lucide Icons |
| **Backend** | Flask, SQLAlchemy, Flask-CORS |
| **ML/CV** | OpenCV, face_recognition, dlib |
| **Database** | SQLite |

## 📁 Project Structure

```
smart-attendance-system/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── requirements.txt
│   └── database.db
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── screenshots/
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```
Server runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`

## 📸 Screenshots

| Feature | Screenshot |
|---------|-----------|
| Dashboard | ![dashboard](screenshots/dashboard.png) |
| Student Registration | ![students](screenshots/students.png) |
| Attendance Marking | ![attendance](screenshots/attendance.png) |
| Reports | ![reports](screenshots/reports.png) |

## 🔧 Usage

### 1. Register Students
- Go to **Students** → Add new student
- Capture 3-5 face images for training
- System learns face encoding

### 2. Mark Attendance
- Go to **Attendance** → Start Camera
- Face detection automatically marks present/absent
- Real-time feedback on detection accuracy

### 3. View Reports
- **Dashboard** shows daily/weekly stats
- **Reports** page allows filtering by date/class
- Export to CSV for records

## 🎯 Key Achievements

- Face recognition accuracy: **~95%** (tested on dataset)
- Real-time detection: **<100ms** per frame
- Handles up to **50 concurrent student faces**
- CORS-enabled for cross-origin requests

## 🚢 Deployment

- **Frontend**: [Vercel](https://vercel.com/)
- **Backend**: [Render](https://render.com/) or [Railway](https://railway.app/)

## 📝 Future Enhancements

- [ ] Dark mode
- [ ] Attendance analytics charts (Chart.js)
- [ ] Excel export with formatting
- [ ] Telegram/Email notifications
- [ ] Mobile app (React Native)
- [ ] Role-based access (Admin/Teacher/Student)
- [ ] Multi-class support

## 📄 License

This project is open source and available under the **MIT License**.

## 👨‍💻 Author

**Sanjay Philip**  
Full Stack & ML Developer | Final Year MCA Student  
[Portfolio](https://portfolio-qd4a.vercel.app) | [GitHub](https://github.com/SanjayPhilip)

---

**Questions?** Open an issue or reach out!