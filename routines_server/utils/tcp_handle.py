import json
import socket
import time


def sendRoutine(routine):
    data = {
        "devices": [{
            "settings": routine.settings,
            "deviceMac": routine.device_mac,
            "hubMac": routine.hub_mac
        }],
        "messageType": "client"
    }

    HOST = 'localhost'
    PORT = 9090

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((HOST, PORT))
        s.sendall(json.dumps(data).encode('utf-8'))


def send_routines_list(routines):
    for routine in routines:
        sendRoutine(routine)
        time.sleep(0.5)
