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

const users = [
    /* リレーションを配列として表現しています． */
    { id: "1", name: "User 1", bookIds: ["1", "3"] },
    { id: "2", name: "User 2", bookIds: ["2", "4", "5"] },
];

const typeDefs = gql`
    type User {
        id: ID!
        name: String!
    }

    extend type Book @key(fields: "id") {
        id: ID! @external
        author: User!
    }
`;

const resolvers = {
    Book: {
        author(book: { id: string }) {
            return users.find((user) => user.bookIds.includes(book.id));
        },
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

await new Promise<void>((resolve) => httpServer.listen({ port: 5002 }, resolve));
console.log("Server ready at 5002 port");
