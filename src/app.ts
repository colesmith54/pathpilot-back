import axios from "axios";
import cors from "cors";
import { dijkstraRoute } from "./dijkstra";
import { aStarRoute } from "./aStar";
import { snapToPoints } from "./helpers";
import graph from "../data/graph.json";
import dotenv from "dotenv";
dotenv.config();

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
const router = express.Router();
const PORT = 3000;

app.use(cors());


router.get("/marker", async (req: any, res: any) => {
  const marker = req.query as Marker;
  const API_KEY = process.env.GOOGLE_API_KEY;
  console.log(marker, API_KEY)
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

router.get("/nearest", async (req: any, res: any) => {
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

router.get("/route", async (req: any, res: any) => {
  const start = req.query.start as Marker;
  const end = req.query.end as Marker;

  const { closestStart, closestEnd } = snapToPoints(start, end);
  const dijkstra = dijkstraRoute(graph as IGraph, closestStart, closestEnd);
  const aStar = aStarRoute(graph as IGraph, closestStart, closestEnd);
  res.status(200).send({ dijkstra, aStar });
});

app.use("/api", router);

app.listen(PORT, (error: any) => {
  if (!error) {
    console.log("Server is running, app is listening on port " + PORT);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});
