import face_recognition
import numpy as np
import cv2
import os


def encode_face_from_path(image_path):
    """Load an image file and return its face encoding."""
    if not os.path.exists(image_path):
        return None, f"File not found: {image_path}"

    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return None, "No face detected in the image."

    return encodings[0], None


def encode_face_from_bytes(image_bytes):
    """Decode an image from bytes and return its face encodings."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    encodings = face_recognition.face_encodings(rgb_image)
    locations = face_recognition.face_locations(rgb_image)

    return encodings, locations


def match_faces(known_encodings, unknown_encoding, tolerance=0.5):
    """
    Compare a list of known encodings against one unknown encoding.
    Returns index of match or -1 if no match found.
    """
    if not known_encodings or unknown_encoding is None:
        return -1

    results = face_recognition.compare_faces(known_encodings, unknown_encoding, tolerance=tolerance)
    distances = face_recognition.face_distance(known_encodings, unknown_encoding)

    if True in results:
        best_match_index = int(np.argmin(distances))
        if results[best_match_index]:
            return best_match_index

    return -1


def draw_boxes_on_image(image_bytes, face_locations, labels):
    """Draw bounding boxes and labels on detected faces."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    for (top, right, bottom, left), label in zip(face_locations, labels):
        color = (0, 255, 0) if label != "Unknown" else (0, 0, 255)
        cv2.rectangle(image, (left, top), (right, bottom), color, 2)
        cv2.rectangle(image, (left, bottom - 25), (right, bottom), color, cv2.FILLED)
        cv2.putText(image, label, (left + 4, bottom - 6),
                    cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)

    _, buffer = cv2.imencode('.jpg', image)
    return buffer.tobytes()
