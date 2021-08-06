import { PrimaryKey, Entity, Property } from "@mikro-orm/core"; 
import { Field, ObjectType, Int } from "type-graphql";


@ObjectType()
@Entity()
export class User {
  @Field(()=> Int)
  @PrimaryKey()
  id!: number;

  @Field(()=> String)
  @Property({type: 'date'})
  createdAt: Date = new Date();

  @Field(()=> String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field()
  @Property({type: 'text', unique: true})
  username!: string; 
 
  @Property({type: 'text'}) //without field decorator because we don't want people to have access to it.
  password!: string; 

}

/**
 * If for any reason I don't want any column exposed, just remove the decorator @Field() off of it;
 */