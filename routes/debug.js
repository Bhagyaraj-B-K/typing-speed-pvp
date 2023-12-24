const debugRouter = new express.Router();

debugRouter.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/debug/index.html'));
})

debugRouter.get('/play', async (req, res) => {
    if(req.query.room && req.query.username)
        res.sendFile(path.join(__dirname + '/../public/debug/typeSpeedPvp.html'));
    else res.send('room and username required');
})

module.exports = debugRouter;