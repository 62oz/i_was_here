const getDistanceFromLatLonInKm = function (userLat, userLon, postLat, postLon) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(postLat - userLat); // deg2rad below
    const dLon = deg2rad(postLon - userLon);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(postLat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

const deg2rad = function (deg) {
    return deg * (Math.PI / 180)
}

module.exports = {
    getDistanceFromLatLonInKm
};
