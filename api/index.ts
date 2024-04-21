import axios from "axios";
import cors from "cors";
import { dijkstraRoute } from "./dijkstra";
import { aStarRoute } from "./aStar";
import { bfsRoute } from "./bfs";
import { snapToPoints } from "./helpers";
import graph from "../data/graph.json";

type Marker = {
  latLng: google.maps.LatLngLiteral;
  placeId: string;
  address: string;
};

interface IGraph {
  [key: string]: {
    end: number[];
    weight: number;
  }[];
}

const express = require("express");
const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/marker", async (req: any, res: any) => {
  const marker = req.query as Marker;
  const API_KEY = process.env.GOOGLE_API_KEY;
  console.log(marker, API_KEY);
  try {
    const markerInfo = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${marker.placeId}&key=${API_KEY}&fields=name,formatted_address`
    );
    res.status(200).send(markerInfo.data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred while fetching marker info");
  }
});

app.get("/api/nearest", async (req: any, res: any) => {
  const marker = req.query as Marker;
  const API_KEY = process.env.GOOGLE_API_KEY;
  try {
    const nearestMarkerInfo = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker.latLng.lat},${marker.latLng.lng}&key=${API_KEY}`
    );
    res.status(200).send(nearestMarkerInfo.data.results[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error occurred while fetching marker info");
  }
});

app.get("/api/route", async (req: any, res: any) => {
  const start = req.query.start as Marker;
  const mid = req.query.mid as Marker | undefined;
  const end = req.query.end as Marker;

  const { closestStart, closestEnd, closestMid } = snapToPoints(start, end, mid);

  const startTime = Date.now();

  const dijkstra = mid ? 
    [...dijkstraRoute(graph as IGraph, closestStart, closestMid), ...dijkstraRoute(graph as IGraph, closestMid, closestEnd)] :
    dijkstraRoute(graph as IGraph, closestStart, closestEnd);
  const dijkstraTime = Date.now() - startTime;

  const aStar = mid ? 
    [...aStarRoute(graph as IGraph, closestStart, closestMid), ...aStarRoute(graph as IGraph, closestMid, closestEnd)] :
    aStarRoute(graph as IGraph, closestStart, closestEnd);
  const aStarTime = Date.now() - startTime - dijkstraTime;

  const bfs = mid ? 
    [...bfsRoute(graph as IGraph, closestStart, closestMid), ...bfsRoute(graph as IGraph, closestMid, closestEnd)] :
    bfsRoute(graph as IGraph, closestStart, closestEnd);
  const bfsTime = Date.now() - startTime - aStarTime - dijkstraTime;

  res.status(200).send({ dijkstra, aStar, dijkstraTime, aStarTime, bfs, bfsTime });
});

app.listen(PORT, (error: any) => {
  if (!error) {
    console.log("Server is running, app is listening on port " + PORT);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});

module.exports = app;