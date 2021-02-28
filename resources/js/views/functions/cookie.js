/**
 * Set cookie
 * @param b
 * @param d
 * @param c
 */
export function setCookie(b, d, c) {
    var a = new Date;
    a.setTime(a.getTime() + 864E5 * c);
    c = "expires\x3d" + a.toUTCString();
    document.cookie = b + "\x3d" + d + ";" + c + ";path\x3d/"
}

/**
 * Get cookie
 * @param b
 * @returns {*}
 */
export function getCookie(b) {
    b += "\x3d";
    for (var d = document.cookie.split(";"), c = 0; c < d.length; c++) {
        for (var a = d[c]; " " == a.charAt(0);)
            a = a.substring(1, a.length);
        if (0 == a.indexOf(b))
            return a.substring(b.length, a.length)
    }
    return null
}
