import { MikroORM } from "@mikro-orm/core";
import { __prod__, __defaultString__ } from "./constants"; 
import microConfig from './mikro-orm.config';
import express from "express";
import {ApolloServer} from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis'; 
import { MyContext } from "./types";
import  cors from 'cors';

const RedisStore = connectRedis(session)
const redisClient = redis.createClient(); //empty for localhost

//this is testing I guess 
 const options: cors.CorsOptions = { 
     allowedHeaders:['Access-Control-Allow-Origin','content-type'],
     origin: true,
     credentials: true, 
     methods: ['POST']
     
 }
 
const main = async ()=>{
    const orm = await MikroORM.init( microConfig );
    await orm.getMigrator().up();
    const app = express();
    app.use(cors(options));
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }), 
        context: ({req,res}): MyContext=> ({ em: orm.em, req, res })
    });
    
    await apolloServer.start();
    

    app.use(
        session({
            name: 'qid', 
            store: new RedisStore({ 
                client: redisClient, 
                disableTouch: true 
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365  * 10, //10 years 
                httpOnly: true,
                secure: __prod__, //cookie only works in https
                sameSite: 'lax' //csrf
            },
            saveUninitialized: false,
            secret: __defaultString__,
            resave: false,
        })
    );
    apolloServer.applyMiddleware({ app,cors: false  });

     
    

    app.get('/', (_,res)=>{
        res.status(200).send("jojojo")
    })
    app.listen(4000, ()=>{
        console.log('server started on localhost:4000') 
    })
    
};

main().catch(err => console.log(err)); 