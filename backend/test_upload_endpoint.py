import requests

url_doc = "http://localhost:8000/documents"
url_upload = "http://localhost:8000/documents/upload"

# Test POST to /documents
try:
    res = requests.post(url_doc)
    print("POST /documents status:", res.status_code)
    print("POST /documents body:", res.json())
except Exception as e:
    print("POST /documents failed:", e)

# Test POST to /documents/upload
try:
    res = requests.post(url_upload)
    print("POST /documents/upload status:", res.status_code)
    print("POST /documents/upload body:", res.json())
except Exception as e:
    print("POST /documents/upload failed:", e)
