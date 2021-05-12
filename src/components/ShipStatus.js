const ShipStatus = (coordsArr, isRotated) => {
    const coords = coordsArr;
    const rotated = isRotated;
    let health = coordsArr.length;

    const hit = () => {
        health--;
    };

    const isSunk = () => {
        if (health === 0) return true
    }

    const rotation = () => {
        return rotated
    }

    return { coords, hit, isSunk, rotation }
}

export default ShipStatus;