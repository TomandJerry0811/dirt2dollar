import httpx
import json

url = "http://localhost:8001/api/v1/client-analysis"
payload = {"user_query": "Give me churn analysis for Yardworx Land Management"}

print(f"Sending POST request to {url}...")
try:
    with httpx.Client(timeout=60.0) as client:
        response = client.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print("Response Text:")
        print(response.text)
except Exception as e:
    print("Request failed:", str(e))
