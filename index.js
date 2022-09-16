import axios from "axios";
import express from "express";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set ,  onValue,update, remove,} from "firebase/database"; 
import { getAuth, signInWithEmailAndPassword} from "firebase/auth";
import dotenv from 'dotenv'
dotenv.config()
import twilio from 'twilio'
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const firebaseConfig = {
    apiKey: "AIzaSyDgjkAFksGTqCUbA4R9m9UAMFM1Cy8MZMw",
    authDomain: "namekujilabs.firebaseapp.com",
    projectId: "namekujilabs",
    storageBucket: "namekujilabs.appspot.com",
    messagingSenderId: "527914262266",
    appId: "1:527914262266:web:b43975b52373a2b3467343",
    measurementId: "G-55B1F2E0LM"
  };

const fire = initializeApp(firebaseConfig);
const app = express()

const auth = getAuth();
signInWithEmailAndPassword(auth, "namesujiserver@gmail.com", "namekuji")
.then((userCredential) => {
})
.catch((error) => {
});

async function getFloorPrice(collection) {
try {
    const url = `https://api.opensea.io/collection/${collection}/stats`;
    const response = await axios.get(url);
    console.log(response.data.stats.floor_price)
    return response.data.stats.floor_price;
} catch (err) {
    console.log(err);
    return undefined;
}
}

function alert1(id,user_given_price,user1,collection,phone,type,whatsapp_alert,discord_alert){
    const WhatsappNumber = phone.replace(/\s+/g,"");
   if(whatsapp_alert== true){
    try {
        client.messages 
      .create({ 
         body: `The ${collection}'s floor price has ${type} [${user_given_price} ETH]
Opensea: https://opensea.io/collection/${collection}`, 
         from: 'whatsapp:+16184271719',       
         to: `whatsapp:${WhatsappNumber}` 
       }) 
      .then(message => console.log(message.sid)) 
      .done();
  }catch (err) {
    console.log(err);
  } 
}
  if(discord_alert==true || whatsapp_alert ==true){
    const db = getDatabase();
    remove(ref(db, 'users/' + user1))
  }
}

async function alertmessage(collection,discord_check,discord_id,higerRange,lowerRange,whatsapp_check,whatsapp_id,Userid,alert){
let result = collection.indexOf("collection/");
let collectionName = collection.slice(result+11)
const target_price = await getFloorPrice(collectionName.trim());
console.log(target_price)
    const less1 = lowerRange;
    const greater1 = higerRange;
    let user_given_price;
    let type ;
    if( (target_price > greater1 || less1 >target_price) && alert =="on" ){
        if(target_price> greater1 ){
        user_given_price = greater1;
        type = "risen above";
        }else{
        user_given_price = less1;
        type = "dropped below";
        }
    alert1(discord_id,user_given_price,Userid,collectionName,whatsapp_id,type,whatsapp_check,discord_check)
    }
}

async function intercvaL(){
const db = getDatabase();
    const users12 = ref(db, 'users' );
    onValue(users12, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
        const childKey = childSnapshot.key;
        const childData = childSnapshot.val();
        alertmessage(childData.collection,childData.discord_check,childData.discord_id,childData.higerRange,childData.lowerRange,childData.whatsapp_check,childData.whatsapp_id,childKey,childData.alert);
    });
    }, {
    onlyOnce: true
    });
}
const interval_calling = setInterval(intercvaL,5000)

const port = 5000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})













 
