import httpx

url = "http://localhost:8001/api/v1/client-analysis"
payload = {"user_query": "Give me churn analysis for Yardworx Land Management"}

try:
    with httpx.Client(timeout=60.0) as client:
        response = client.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Response Keys:", list(data.keys()))
            print("Client Name:", data.get("client", {}).get("name"))
            print("Churn Probability:", data.get("churn", {}).get("probability"))
            print("Risk Level:", data.get("churn", {}).get("risk_level"))
            print("Summary Length:", len(data.get("summary", {}).get("text") or ""))
            print("Recommendations Count:", len(data.get("recommendations", [])))
            print("Historical Matches Count:", len(data.get("historical_context", {}).get("historical_matches", [])))
        else:
            print("Error response:", response.text)
except Exception as e:
    print("Failed:", str(e))
