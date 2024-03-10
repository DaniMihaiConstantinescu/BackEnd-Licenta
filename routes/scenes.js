const express = require('express')
const router = express.Router()

const { child, get, ref, onValue } = require("firebase/database");
const { dbRef } = require("../firebase");

router.get('/', async (req, res) => {

    console.log();
    console.log("------------------------ Users ------------------------");
    console.log();

    get(child(dbRef, `users`)).then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });



    // try {
    //     const usersRef = child(dbRef, '/users');
    //     const usersSnapshot = await get(usersRef);
    
    //     if (usersSnapshot.exists()) {
    //       const usersData = usersSnapshot.val();
    //       console.log(usersData);
    //       res.send(usersData);
    //     } else {
    //       console.log('No data in the "users" collection');
    //       res.status(404).send('No data in the "users" collection');
    //     }
    //   } catch (error) {
    //     console.error('Error while fetching the database:', error);
    //     res.status(500).send('Internal Server Error');
    // }


    res.send("All scenes")

})

router.get('/:id', (req, res) => {
    res.send("Get scene with the id " + req.params.id)
})

router
    .route('/:id')
    .get((req, res) => {
        res.send("Get scene with the id " + req.params.id)
    })
    .put((req, res) => {
        res.send("Update scene with the id " + req.params.id)
    })
    .delete((req, res) => {
        res.send("Delete scene with the id " + req.params.id)
    })

module.exports = router