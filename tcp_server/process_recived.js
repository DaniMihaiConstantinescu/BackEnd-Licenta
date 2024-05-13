function process_recived(data, socket, ipMacMap){

    const {messageType} = data

    switch (messageType) {
        case "hub":
            handleHub(data, socket, ipMacMap);
            break;

        case "client": 
            handleClient(data, socket, ipMacMap);
            break;
        case "initialize":
            console.log();
            console.log("Initialize data:",data);
            console.log();
            ipMacMap.set(data.mac, socket)
            break;
        
        default:
            console.log("Uncovered case");
            console.log(data);
            break;
    }
}

function handleHub(data, socket, ipMacMap){
    console.log();
    console.log("Hub sent");

    const {device, deviceMac, hubMac} = data
    console.log("hub mac: ", hubMac);
    console.log("device mac: ", deviceMac);
    console.log("device settings: ",device);

    // write to db 
}

function handleClient(data, socket, ipMacMap){
    console.log();
    console.log("Client sent");
    console.log(data);

    const {devices} = data

    devices.forEach(device => {
        const {settings, deviceMac} = device
        
    //     forward message to the hub without message type and hubMac
        const hubSocket = ipMacMap.get(device.hubMac);
        if (hubSocket) {
            hubSocket.write(JSON.stringify({
                settings,
                deviceMac,
            }));
        } else {
            console.log(`Hub socket not found for MAC address: ${device.hubMac}`);
        }

    });
}

module.exports = { process_recived }