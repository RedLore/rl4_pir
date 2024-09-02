var Pbf = require("pbf")
var WPPayload = require("./wirepasMessage.js").GenericMessage

const deviceID = 852877704   //0x02 87 8B C9


const config = require("config")

const mqttConfig = config.get("mqtt")

/*MQTT*/
var mqtt = require("mqtt");
var client = mqtt.connect(`mqtts://${mqttConfig.host}`, {
    username: mqttConfig.username,
    password: mqttConfig.password,
    port: mqttConfig.port
})


const gatewayConfig = config.get("gateway")

const gatewayID = gatewayConfig.id
const sinkID = gatewayConfig.sink


function sendDownlink(gateway, device, sinkID) {

    var wirepasMessage = {
        wirepas: {
            send_packet_req: {
                header: {
                    req_id: 24
                },
                destination_address: device,
                source_endpoint: 10,
                destination_endpoint: 5,
                qos: 1,
                payload: [0x03]
            }
        }
    }

    var wppbf = new Pbf()
    WPPayload.write(wirepasMessage, wppbf)
    var WPpayloadBuffer = wppbf.finish()

    client.publish("gw-request/send_data/" + gateway + "/" + sinkID, WPpayloadBuffer)
    console.log("Downlink sent to Gateway " + gateway + " for Device " + device)
}

client.on("connect", async function () {
    console.log("MQTT Connection established")

    // client.subscribe("gw-response/send_data/" + gatewayID + "/" + sinkID + "/#", function (err) {
    //     if (!err) {
    //     } else {
    //         console.error("Error subscribing to topic in MQTT Server " + err)
    //     }
    // })

    client.subscribe("gw-event/received_data/+/+/+/5/8", function (err) {   //Acknowledge
        if (!err) {
        } else {
            console.error("Error subscribing to topic in MQTT Server " + err)
        }
    })

    console.log(`Downlink sent at ${(new Date()).toISOString()}`)
    sendDownlink(gatewayID, deviceID, sinkID)
})

client.on("message", async function (topic, message, packet) {
    var pbf = new Pbf(message)
    var wirepasMessage = WPPayload.read(pbf)

    var serialNumber = wirepasMessage.wirepas.packet_received_event.source_address;

    console.log(serialNumber, wirepasMessage.wirepas.packet_received_event.payload[0])
})
