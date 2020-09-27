const express = require ('express');
const mongoose = require ('mongoose');
const Message = require ('./dbMessages');
const Pusher = require ('pusher');
const cors = require ('cors');


const app = express();
const port =process.env.PORT || 9000;

//for:realtime :used pusher

var pusher = new Pusher({
  appId: '1071235',
  key: 'b81c8ca60301b38c2ee3',
  secret: '9d363ec45f76eb2d6ecc',
  cluster: 'ap2',
  encrypted: true
});


//middleware
app.use(express.json())
app.use(cors())

app.use((req ,res, next) => {
    res.setHeader("Access-Control-Allow-Orgin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})


//dbconfig
const connectionURL='mongodb+srv://chatwhat:chatwhat@cluster0.lslms.gcp.mongodb.net/chatwhat?retryWrites=true&w=majority'

mongoose.connect(connectionURL,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})
const db=mongoose.connection;
db.once("open",()=>{
    console.log("db ad realtime db with pusher will work let see");
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change",(change) => {
        console.log("A Change occured", change);
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages','inserted',{
                name: messageDetails.user,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        }else {
            console.log('Error triggering Pusher')
        }
    });
})

db.on('connected',() =>{
    console.log("Hey Your db connected so dont worry only you application enjoy ")
});

db.on('error',(err)=>{
    console.log("error while connecting db please check me")
})



//api routes
app.get('/',(req,res) =>res.status(200).send('hello world'));

app.get('/message/sync',(req,res)=>{
    Message.find((err,data) => {
        if(err){
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/message/new', (req,res) =>{
    const dbMessage = req.body;

        Message.create(dbMessage, (err,data) =>{
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }

    })

})


//listen
app.listen(port, () => console.log(`Serve is running on: ${port}`));