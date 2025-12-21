import express from "express"


const app = express()

app.get('/api/check',(req,res)=> res.status(200).json({message:"success"}))

app.listen(3000,()=>console.log('server is up and running'))