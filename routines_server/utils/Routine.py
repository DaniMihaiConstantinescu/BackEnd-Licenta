import json
from datetime import datetime, time


class Routine:
    def __init__(self, from_time, until_time, days, settings, device_mac, hub_mac, schedule_id):
        self.from_time = from_time
        self.until_time = until_time
        self.days = days
        self.settings = settings
        self.device_mac = device_mac
        self.hub_mac = hub_mac
        self.schedule_id = schedule_id

    def __str__(self):
        return (f"Routine(schedule_id={self.schedule_id}, from={self.from_time}, until={self.until_time}, "
                f"days={self.days}, settings={self.settings}, device_mac={self.device_mac}, hub_mac={self.hub_mac})")

    def __repr__(self):
        return self.__str__()


def process_json(json_data):
    try:
        data = json.loads(json_data)

        # Validate required keys
        required_keys = {"schedule_id", "hubMac", "device", "days", "from", "until"}
        if not all(key in data for key in required_keys):
            return None

        if not isinstance(data["device"], dict):
            return None

        from_time = data["from"]
        until_time = data["until"]
        days = data["days"]
        settings = data["device"]["settings"]
        mac_address = data["device"]["deviceMac"]
        hub_mac = data["hubMac"]
        schedule_id = data["schedule_id"]

        return Routine(from_time, until_time, days, settings, mac_address, hub_mac, schedule_id)

    except json.JSONDecodeError:
        return None


def is_remove_request(message):
    try:
        data_dict = json.loads(message)
        routine_id = data_dict.get("remove")
        if routine_id:
            return routine_id
        else:
            return None
    except json.JSONDecodeError:
        return None


def is_routine_active(routine):
    now = datetime.now()
    current_time = now.time()

    if now.weekday() not in routine.days:
        return False

    from_time = time.fromisoformat(routine.from_time)
    until_time = time.fromisoformat(routine.until_time)

    if from_time > until_time:
        # Routine spans midnight
        active = from_time <= current_time or current_time <= until_time
    else:
        # Routine within a single day
        active = from_time <= current_time <= until_time

    return active
