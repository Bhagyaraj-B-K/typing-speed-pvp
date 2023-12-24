const userRouter = new express.Router();

userRouter.get('/', async (req, res) => {
    res.send('user route');
})

module.exports = userRouter;