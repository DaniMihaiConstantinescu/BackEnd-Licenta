import requests
from utils.Routine import Routine


def get_all_active_schedules():
    api_url = "http://localhost:5000/schedules/all-active-schedules"

    result = []
    response = requests.get(api_url)

    if response.status_code == 200:
        data = response.json()
        for schedule in data:
            required_keys = {"schedule_id", "hubMac", "device", "days", "from", "until"}
            if all(key in schedule for key in required_keys) and isinstance(schedule["device"], dict):
                result.append(
                    Routine(
                        from_time=schedule["from"],
                        until_time=schedule["until"],
                        days=schedule["days"],
                        settings=schedule["device"]["settings"],
                        device_mac=schedule["device"]["macAddress"],
                        hub_mac=schedule["hubMac"],
                        schedule_id=schedule["schedule_id"]
                    )
                )

    return result
