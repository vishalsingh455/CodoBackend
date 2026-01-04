const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();  // generate 6 digit numeric code
};

export default generateRoomCode;
