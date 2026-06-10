from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, date
import numpy as np
import base64
import io
import os

from face_utils import (
    encode_face_from_path,
    encode_face_from_bytes,
    match_faces,
    draw_boxes_on_image
)

app = Flask(__name__)
CORS(app)

# --- Database Config ---
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'attendance.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Models ---

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    image_path = db.Column(db.String(200), nullable=False)
    face_encoding = db.Column(db.Text, nullable=True)  # stored as comma-separated floats
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'roll_number': self.roll_number,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat()
        }


class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    date = db.Column(db.Date, default=date.today)
    status = db.Column(db.String(10), default='present')  # present / absent
    marked_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('Student', backref='attendances')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name,
            'roll_number': self.student.roll_number,
            'date': self.date.isoformat(),
            'status': self.status,
            'marked_at': self.marked_at.isoformat()
        }


# --- Helper ---

def get_all_encodings():
    """Return list of (student, encoding_array) for all students with encodings."""
    students = Student.query.filter(Student.face_encoding.isnot(None)).all()
    result = []
    for s in students:
        enc = np.array([float(x) for x in s.face_encoding.split(',')])
        result.append((s, enc))
    return result


# --- Routes ---

@app.route('/')
def index():
    return jsonify({'message': 'Smart Attendance System API is running ✅'})


# -- Students --

@app.route('/students', methods=['GET'])
def get_students():
    students = Student.query.order_by(Student.created_at.desc()).all()
    return jsonify([s.to_dict() for s in students])


@app.route('/students', methods=['POST'])
def add_student():
    data = request.json
    name = data.get('name', '').strip()
    roll_number = data.get('roll_number', '').strip()
    image_path = data.get('image_path', '').strip()

    if not name or not roll_number or not image_path:
        return jsonify({'error': 'name, roll_number, and image_path are required'}), 400

    if Student.query.filter_by(roll_number=roll_number).first():
        return jsonify({'error': 'Roll number already exists'}), 409

    encoding, err = encode_face_from_path(image_path)
    if err:
        return jsonify({'error': err}), 422

    student = Student(
        name=name,
        roll_number=roll_number,
        image_path=image_path,
        face_encoding=','.join(map(str, encoding.tolist()))
    )
    db.session.add(student)
    db.session.commit()
    return jsonify(student.to_dict()), 201


@app.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    student = Student.query.get_or_404(student_id)
    db.session.delete(student)
    db.session.commit()
    return jsonify({'message': 'Student deleted'})


# -- Attendance --

@app.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo uploaded'}), 400

    file = request.files['photo']
    image_bytes = file.read()
    target_date_str = request.form.get('date', date.today().isoformat())

    try:
        target_date = date.fromisoformat(target_date_str)
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    # Detect faces
    unknown_encodings, face_locations = encode_face_from_bytes(image_bytes)

    if not unknown_encodings:
        return jsonify({'error': 'No faces detected in the uploaded photo'}), 422

    known = get_all_encodings()
    if not known:
        return jsonify({'error': 'No students registered yet'}), 422

    known_students = [s for s, _ in known]
    known_encodings = [enc for _, enc in known]

    marked = []
    labels = []

    for unknown_enc in unknown_encodings:
        idx = match_faces(known_encodings, unknown_enc)
        if idx != -1:
            student = known_students[idx]
            labels.append(student.name)

            # Avoid duplicate attendance for same student/date
            existing = Attendance.query.filter_by(
                student_id=student.id, date=target_date
            ).first()
            if not existing:
                record = Attendance(
                    student_id=student.id,
                    date=target_date,
                    status='present'
                )
                db.session.add(record)
                marked.append(student.to_dict())
        else:
            labels.append('Unknown')

    db.session.commit()

    # Return annotated image as base64
    annotated = draw_boxes_on_image(image_bytes, face_locations, labels)
    annotated_b64 = base64.b64encode(annotated).decode('utf-8')

    return jsonify({
        'marked': marked,
        'total_detected': len(unknown_encodings),
        'total_marked': len(marked),
        'annotated_image': annotated_b64
    })


@app.route('/attendance', methods=['GET'])
def get_attendance():
    date_str = request.args.get('date')
    student_id = request.args.get('student_id')

    query = Attendance.query

    if date_str:
        try:
            filter_date = date.fromisoformat(date_str)
            query = query.filter_by(date=filter_date)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

    if student_id:
        query = query.filter_by(student_id=int(student_id))

    records = query.order_by(Attendance.marked_at.desc()).all()
    return jsonify([r.to_dict() for r in records])


@app.route('/attendance/report', methods=['GET'])
def attendance_report():
    """Return per-student attendance summary."""
    students = Student.query.all()
    report = []
    for s in students:
        total = Attendance.query.filter_by(student_id=s.id, status='present').count()
        report.append({
            'student': s.to_dict(),
            'total_present': total
        })
    return jsonify(report)


@app.route('/dashboard/stats', methods=['GET'])
def dashboard_stats():
    total_students = Student.query.count()
    today_count = Attendance.query.filter_by(date=date.today(), status='present').count()
    total_sessions = db.session.query(Attendance.date).distinct().count()
    return jsonify({
        'total_students': total_students,
        'present_today': today_count,
        'total_sessions': total_sessions
    })


# --- Init ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database initialized.")

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port
    )