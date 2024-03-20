import mqtt from "mqtt";
import {getMQTTBroker} from "@/common";

export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export const subscribe_topic = (topic, callback ) => {
    const client = mqtt.connect(getMQTTBroker(),{
        rejectUnauthorized: false,
        clientId: 'metapower-social'
    });

    client.on("connect", () => {
        console.log("Connected to MQTT broker");
        client.subscribe(topic, (err) => {
            if (err) {
                console.error("Error subscribing to topic:", err);
            } else {
                console.log("Subscribed to topic: ", topic);
                client.on("message", (topic, message) => {
                    console.log("Received message on topic:", topic);
                    // console.log("Message:", message);
                    callback(message)
                });
            }
        });
    });
    client.on("error", (err) => {
        console.error("Error connecting to MQTT broker:", err);
    });
}

