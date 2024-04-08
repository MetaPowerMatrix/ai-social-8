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
export function getBrowserType() {
    const userAgent = navigator.userAgent.toLowerCase();
    console.log(userAgent)
    if (userAgent.indexOf('chrome') !== -1) {
        return 'chrome';
    } else if (userAgent.indexOf('firefox') !== -1) {
        return 'firefox';
    } else if (userAgent.indexOf('safari') !== -1) {
        return 'safari';
    } else if (userAgent.indexOf('edge') !== -1) {
        return 'edge';
    } else if (userAgent.indexOf('opera') !== -1) {
        return 'opera';
    }
}

export function getOS() {
    const userAgent = navigator.userAgent.toLowerCase();
    console.log(userAgent)
    if (userAgent.indexOf('chrome') !== -1 && userAgent.indexOf('iphone') === -1) {
        return 'chrome';
    }else if (userAgent.indexOf('iphone') !== -1) {
        return 'iphone';
    } else if (userAgent.indexOf('macintosh') !== -1) {
        return 'macosx';
    }

    return 'unknown';
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
