from datetime import datetime
import threading
import time
from utils.Routine import Routine


def timeDiffInSecs(routine):
    now = datetime.now()
    return now.minute == routine.minute and now.hour == routine.hour


def checkRoutines():
    while True:
        now = datetime.now()
        print(f"Checking routines at {now.strftime('%H:%M:%S')}")
        with routines_lock:
            for r in routines:
                if timeDiffInSecs(r):
                    print(f"Routine scheduled at {r.hour:02}:{r.minute:02} is within the current minute.")
        print()

        # Sleep until the start of the next minute
        now = datetime.now()
        sleep_time = 60 - now.second - now.microsecond / 1_000_000
        time.sleep(sleep_time)


def addRoutine():
    while True:
        try:
            hour = int(input("Enter hour (0-23): "))
            minute = int(input("Enter minute (0-59): "))
            if 0 <= hour < 24 and 0 <= minute < 60:
                with routines_lock:
                    routines.append(Routine(hour, minute))
                    print(f"Routine added for {hour:02}:{minute:02}")
            else:
                print("Invalid time. Please enter again.")
        except ValueError:
            print("Invalid input. Please enter numeric values.")


if __name__ == '__main__':
    routines = []
    routines_lock = threading.Lock()

    # Add initial routines
    routines.append(Routine(18, 5))
    routines.append(Routine(18, 8))
    routines.append(Routine(18, 9))

    # Perform an initial check of the routines
    now = datetime.now()
    print(f"Initial check at {now.strftime('%H:%M:%S')}")
    with routines_lock:
        for routine in routines:
            if timeDiffInSecs(routine):
                print(f"Routine scheduled at {routine.hour:02}:{routine.minute:02} is within the current minute.")

    # Calculate initial sleep time to align with the start of the next minute
    now = datetime.now()
    initial_sleep_time = 60 - now.second - now.microsecond / 1_000_000
    time.sleep(initial_sleep_time)

    # Create and start the threads
    routine_thread = threading.Thread(target=checkRoutines)
    routine_thread.daemon = True
    routine_thread.start()

    add_routine_thread = threading.Thread(target=addRoutine)
    add_routine_thread.daemon = True
    add_routine_thread.start()

    while True:
        time.sleep(1)
