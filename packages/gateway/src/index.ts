import http from "http";

import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import express from "express";

const app = express();
const httpServer = http.createServer(app);

const serviceList = [
    { name: "book", url: "http://localhost:5001/graphql" },
    { name: "user", url: "http://localhost:5002/graphql" },
];

const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
        subgraphs: serviceList,
        pollIntervalInMs: 1000,
    }),
})

const server = new ApolloServer({
    gateway,
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

await new Promise<void>((resolve) => httpServer.listen({ port: 5000 }, resolve));
console.log("Server ready at 5000 port");
