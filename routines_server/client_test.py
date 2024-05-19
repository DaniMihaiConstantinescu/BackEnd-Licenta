import socket


def send_json1():
    return """{
        "schedule_id": "1233",
        "hubMac": "hubMacaddress",
        "device": {
                "macAddress": "addressamac",
                "settings": {
                    "temperature": "22.5"
                }
            }
        ,
        "days": [
            0,
            1,
            5
        ],
        "from": "15:30",
        "until": "20:17"
    }
    """


def send_json2():
    return """{
        "schedule_id": "1234",
        "hubMac": "hubMacaddress",
        "device": {
                "macAddress": "addressamac",
                "settings": {
                    "temperature": "22.5"
                }
            }
        ,
        "days": [
            0,
            1,
            5
        ],
        "from": "20:18",
        "until": "22:30"
    }
    """

def send_json3():
    return """{
        "remove": "1234"
    }
    """


HOST = 'localhost'  # The server's hostname or IP address
PORT = 7070        # The port used by the server

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.connect((HOST, PORT))
    while True:
        data = input('Enter message to send (or "quit" to exit): ')

        if data == 'quit':
            break
        if data == "1":
            s.sendall(send_json1().encode('utf-8'))
        elif data == "2":
            s.sendall(send_json2().encode('utf-8'))
        elif data == "3":
            s.sendall(send_json3().encode('utf-8'))
        else:
            s.sendall(data.encode('utf-8'))  # Encode data as bytes before sending

print('Connection closed')
