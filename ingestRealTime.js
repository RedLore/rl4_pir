var Pbf = require("pbf");
var WPPayload = require("./wirepasMessage.js").GenericMessage

var t = require("typebase")

const config = require("config")

const mqttConfig = config.get("mqtt")


/*MQTT*/
var mqtt = require("mqtt");
var client = mqtt.connect(`mqtts://${mqttConfig.host}`, {
    username: mqttConfig.username,
    password: mqttConfig.password,
    port: mqttConfig.port
})

PIRRealTimeInfo = t.Struct.define([
    ["sequence", t.ui8],
    ["battery", t.ui16],
    ["pirSensitivity", t.ui8],
    ["pirTripSequence", t.ui8],
])


client.on("connect", async function () {
    console.log("MQTT Connection established")
    /**Subscribe to the MQTT Broker - ANCHOR*/
    client.subscribe(`gw-event/received_data/+/+/+/5/5`, function (err) {
        if (!err) {
        } else {
            console.error("Error Subscribing to Status Endpoints " + err)
        }
    })
})

client.on("message", async function (topic, message, packet) {
    //console.log(topic)
    var pbf = new Pbf(message)
    var wirepasMessage = WPPayload.read(pbf)

    var serialNumber = wirepasMessage.wirepas.packet_received_event.source_address;

    var pirRealTimeMsg = PIRRealTimeInfo.unpack(new t.Pointer(wirepasMessage.wirepas.packet_received_event.payload, 0))


    console.log(serialNumber, pirRealTimeMsg);
})