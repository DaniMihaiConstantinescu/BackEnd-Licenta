import time
import socket
import threading
from datetime import datetime
from utils.Routine import process_json, is_routine_active, is_remove_request
from utils.api_handle import get_all_active_schedules
from utils.tcp_handle import send_routines_list


def checkRoutines():
    while True:
        time_now = datetime.now()
        print(f"Checking routines at {time_now.strftime('%H:%M:%S')}")
        with routines_lock:
            for r in routines:
                if is_routine_active(r):
                    # TODO: Send command to TCP server
                    print(f"Routine scheduled at {r.from_time}-{r.until_time} is active.")
        print()

        # Sleep until the start of the next minute
        time_now = datetime.now()
        sleep_time = 60 - time_now.second - time_now.microsecond / 1_000_000
        time.sleep(sleep_time)


if __name__ == '__main__':

    # initialize routines with the active routines from db
    routines = get_all_active_schedules()
    routines_lock = threading.Lock()

    routines_to_send = []

    now = datetime.now()
    print(f"Initial check at {now.strftime('%H:%M:%S')}")
    with routines_lock:
        for routine in routines:
            if is_routine_active(routine):
                routines_to_send.append(routine)
                print(f"Routine scheduled at {routine.from_time}- {routine.until_time} is active.")

    # Send the routines to TCP server with small delay between
    threading.Thread(target=send_routines_list, args=(routines_to_send,)).start()

    # Calculate initial sleep time to align with the start of the next minute
    now = datetime.now()
    initial_sleep_time = 60 - now.second - now.microsecond / 1_000_000
    time.sleep(initial_sleep_time)

    routine_thread = threading.Thread(target=checkRoutines)
    routine_thread.daemon = True
    routine_thread.start()

    # ------------------- TCP SERVER -------------------
    HOST = 'localhost'
    PORT = 7070


    def handle_client(connection, address):
        global routines

        print(f'Connected by {address}')
        while True:
            data = connection.recv(1024)
            if not data:
                break
            remove_routine_id = is_remove_request(data)
            if remove_routine_id:
                with routines_lock:
                    routines = [routine for routine in routines if routine.schedule_id != remove_routine_id]
                print(f'Routine with id {remove_routine_id} removed')
            else:
                new_routine = process_json(data)
                if new_routine:
                    print("Routine created")
                    routines.append(new_routine)
                else:
                    print(f'Received from {addr}: {data.decode("utf-8")}')

        connection.close()
        print(f'Client {address} disconnected')


    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print(f'Server listening on {HOST}:{PORT}')
        while True:
            conn, addr = s.accept()  # Accept a new connection
            client_thread = threading.Thread(target=handle_client, args=(conn, addr))
            client_thread.start()
