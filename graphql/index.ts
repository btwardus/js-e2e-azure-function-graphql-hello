import { ApolloServer, gql} from "apollo-server-azure-functions";
import { v4 as uuid } from 'uuid';

const database = { [uuid()] :{"name": "John Doe", "dob": "", "address": "good morning"} };


const typeDefs = gql`
    input PersonInput {
        name: String
        dob: String
        address: String  
    }

    type Person {
        id: ID!
        dob: String
        name: String
        address: String
        
    }

    type Query {
        getPerson(id: ID!): Person,
        getPersons:[Person]
    }

    type Mutation {
        createPerson(input: PersonInput): Person
        updatePerson(id: ID!, input: PersonInput): Person
    }
`;

class Person {

    id: any;
    name: string;
    dob: string;
    address: string;

    constructor(id: String, {name, dob, address}) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.address = address;
    }
}

const resolvers = {
    Mutation: {
        createPerson: (_, {input}) => {
            const id = uuid();

            database[id] = input;
            return new Person(id, input);
        },
        updatePerson: (_, {id, input}) => {
            if (!database[id]) {
                throw new Error('no Person exists with id ' + id);
            }
            database[id] = input;
            return new Person(id, input);
        },
    },
    Query: {
        getPerson: (_, {id}) => {
            if (!database[id]) {
                throw new Error('no Person exists with id! ' + id);
            }
            return new Person(id, database[id]);
        },
        getPersons: (_, ) => {
            let arr = [];
            for (var key in database) {
                if (database.hasOwnProperty(key)) {
                    arr.push({
                        id: key,
                        name: database[key].name,
                        dob: database[key].name,
                        address: database[key].address
                    });
                }
            }
            return arr;
        },
    }
};
// @ts-ignore
const server = new ApolloServer({ typeDefs, resolvers, playground: true});

export default server.createHandler({
  cors: {
    origin: '*'
  },
});