const mongoose =require('mongoose')

const ConnectDB = ()=>{
    try {
        
mongoose.connect('mongodb://127.0.0.1/Scrab-PMK').then(()=>{
    console.log('database is connected');
})

    } catch (error) {
        console.log(error,'error in conneting config');
        
    }
}

module.exports=ConnectDB
