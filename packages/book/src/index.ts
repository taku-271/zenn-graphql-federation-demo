import http from "http";

import { gql } from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import express from "express";

const app = express();
const httpServer = http.createServer(app);

const books = [
    { id: "1", title: "Book 1" },
    { id: "2", title: "Book 2" },
    { id: "3", title: "Book 3" },
    { id: "4", title: "Book 4" },
    { id: "5", title: "Book 5" },
];

const typeDefs = gql`
    type Book {
        id: ID!
        title: String!
    }

    type Query {
        getBooks: [Book]!
    }
`;

const resolvers = {
    Query: {
        getBooks: () => {
            return books;
        }
    },
};

const server = new ApolloServer({
    /* ここを `buildSubgraphSchema` に変える */
    schema: buildSubgraphSchema([
        {
            typeDefs,
            resolvers,
        },
    ]),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }) => {
            return { headers: req.headers };
        },
    })
);

await new Promise<void>((resolve) => httpServer.listen({ port: 5001 }, resolve));
console.log("Server ready at 5001 port");
