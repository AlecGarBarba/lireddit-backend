import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2';

@InputType() //this is for arguments
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string 
}

@ObjectType()
class FieldError{
    @Field()
    field: string
    @Field()
    message: string
}


@ObjectType() //this is for mutations
class UserResponse {
    @Field(()=> [FieldError],{nullable: true})
    errors?: FieldError[]

    @Field(()=> User,{nullable: true})
    user?: User

}

@Resolver()
export class UserResolver {
    @Query(()=> User,{nullable: true})
    async me(
        @Ctx() {em, req}: MyContext
    ){
        if( !req.session.userId){
            return null;
        }
        const user = await em.findOne(User, {id: req.session.userId});
        return user;
    }

    @Mutation(()=> UserResponse)
    async register(
        @Arg('options', ()=> UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ): Promise<UserResponse>{
        if(options.username.length <= 2){
            return{
                errors: [{
                    field: "username",
                    message: "Length must be greater than 2"
                }]
            }
        }
        if(options.password.length <= 8){
            return{
                errors: [{
                    field: "password",
                    message: "Length must be greater than 8"
                }]
            }
        } 
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, {username: options.username, password: hashedPassword});
        try{
            await em.persistAndFlush(user);
        }catch(err){
            if(err.code ==="23505" || err.detail.includes("already exists")){
                return{
                    errors: [{
                        field: "username",
                        message: "The username has already been taken"
                    }]
                }
            }
            return{
                errors: [{
                    field: "username",
                    message: "Internal error"
                }]
            }
        }
        
        return {
            user
        };
    }

    @Mutation(()=> UserResponse)
    async login(
        @Arg('options', ()=> UsernamePasswordInput) options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ):Promise<UserResponse>{    
        const user = await em.findOne(User, {username: options.username});
        if(!user){
            return{
                errors: [ {
                    field: 'username',
                    message:"That username doesn't exist"
                }]
            }
        }  
        const valid = await argon2.verify(user.password , options.password);
        if(!valid){
            return{
                errors: [ {
                    field: 'username',
                    message:"Invalid login"
                }]
            }
        }

        try{
            req.session.userId = user.id;
        }catch (err){
            console.log(req.session);
            console.log(err.message)
        }
        

        return {
            user,
        };
    }

}