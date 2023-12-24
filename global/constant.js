module.exports = {
    STATUS : {
        ACTIVE : 1,
        READY : 2,
        INGAME : 3,
        COMPLETED : 4,
    },
    TIMER: {
        ROOM : process.env.GAMETIMER || 60,
        BUFFER : 5,
    },
    GAMEPLAY: {
        MAX_WORDS: process.env.MAX_WORDS || 25,
    }
}