const Express = require("express");
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { Playlist } = require("../models");

router.get('/', async (req, res) => {
    try {
        const entries = await Playlist.findAll();
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

router.get("/mine", validateJWT, async (req, res) => {
    const { id } = req.user;
    try {
        const userPlaylists = await Playlist.findAll({
            where: {
                owner: id
            }
        })
        res.status(200).json(userPlaylists);
    } catch (err) {
        res.status(500).json({ error: err });
    }
})

router.post("/insert", validateJWT, async (req, res) => {
    const { publishDate, title, description, status } = req.body.playlist;
    const { id } = req.user;
    const playlistEntry = {
        publishDate,
        title,
        description,
        status,
        owner: id
    }
    try {
        const newPlaylist = await Playlist.create(playlistEntry);
        res.status(200).json(newPlaylist);
    } catch (err) {
        res.status(500).json({ error: err });
    }
    Playlist.create(playlistEntry)
})

router.get("/:title", async (req, res) =>{
    const { title } = req.params;
    try {
        const results = await Playlist.findAll({
            where: { title: title }
        });
        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ error: err })
    }
})

router.put("/update:entryId", validateJWT, async (req, res) => {
    const { publishDate, title, description, status } = req.body.playlist;
    const playlistId = req.params.entryId;
    const userId = req.user.id;
    
    const query = {
        where: {
            id: playlistId,
            owner: userId
        }
    }
    
    const updatedPlaylist = {
        publishDate: publishDate,
        title: title,
        description: description,
        status: status
    }

    try {
        const update = await Playlist.update(updatedPlaylist, query);
        res.status(200).json(update);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

router.delete("/delete/:id", validateJWT, async (req, res) => {
    const ownerId = req.user.id;
    const playlistId = req.params.id;

    try {
        const query = {
            where: {
                id: playlistId,
                owner: ownerId
            }
        };

        await Playlist.destroy(query);
        res.status(200).json({ message: "Playlist Entry Removed" });
    } catch (err) {
        res.status(500).json({ error: err});
    }
})

module.exports = router;