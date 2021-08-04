import { PrimaryKey, Entity, Property } from "@mikro-orm/core"; 
import { Field, ObjectType, Int } from "type-graphql";


@ObjectType()
@Entity()
export class Post {
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
  @Property({type: 'text'})
  title!: String; 

}