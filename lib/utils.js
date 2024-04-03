import mqtt from "mqtt";
import {getMQTTBroker} from "@/common";
import dayjs from "dayjs";

export function getTodayDateString() {
    const dayjsObject = dayjs();
    return dayjsObject.format('YYYY-MM-DD')
}

export const formatDateTimeString = (timestamp) => {
    const dayjsObject = dayjs(timestamp);
    // return dayjsObject.format('YYYY-MM-DD HH:mm')
    return dayjsObject.format('HH:mm')
}

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

// const client = mqtt.connect(getMQTTBroker());
// client.on("connect", () => {
//     console.log("Connected to MQTT broker");
// });
// client.on("error", (err) => {
//     console.error("Error connecting to MQTT broker:", err);
// });
// export const subscribe_topic = (topic, callback ) => {
//     // const client = mqtt.connect(getMQTTBroker(),{rejectUnauthorized: false});
//     // client.on("connect", () => {
//     //     console.log("Connected to MQTT broker");
//         client.subscribe(topic, (err) => {
//             if (err) {
//                 console.error("Error subscribing to topic:", err);
//             } else {
//                 console.log("Subscribed to topic: ", topic);
//                 client.on("message", (topic, message) => {
//                     console.log("Received message on topic:", topic);
//                     // console.log("Message:", message);
//                     callback(message)
//                 });
//             }
//         });
//     // });
//     // client.on("error", (err) => {
//     //     console.error("Error connecting to MQTT broker:", err);
//     // });
// }
// export const unsubscribe_topic = (topic ) => {
//         client.unsubscribe(topic, (err) => {
//         if (err) {
//             console.error("Error unsubscribing to topic:", err);
//         } else {
//             console.log("Unsubscribed to topic: ", topic);
//         }
//     })
// }
