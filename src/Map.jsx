import { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getSearchResultsFetch,
  getSearchResultsSuccess,
} from "./redux/reducers/searchState";
import mapboxgl from "mapbox-gl";
import { seaRoute } from "searoute-ts";

import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

import portMarkerIcon from "./assets/portMarker.png";

const INITIAL_CENTER = [-123.071437, 49.29777778];
const INITIAL_ZOOM = 10.12;

const Map = () => {
  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  const searchResults = useSelector((state) => state.search.searchResults);
  const dispatch = useDispatch();

  const mapRef = useRef();
  const mapContainerRef = useRef();

  const handleSearch = (value) => {
    if (value.length === 0) {
      dispatch(getSearchResultsSuccess([]));
      return;
    }

    dispatch(getSearchResultsFetch(value));
  };

  const handleSearchResultClick = (result) => {
    mapRef.current.easeTo({
      center: result.geometry.coordinates,
      zoom: zoom,
    });
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      //style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom,
    });

    mapRef.current.on("move", () => {
      const mapCenter = mapRef.current.getCenter();
      const mapZoom = mapRef.current.getZoom();

      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);
    });

    mapRef.current.on("load", () => {
      mapRef.current.loadImage(portMarkerIcon, (error, image) => {
        if (error) throw error;
        mapRef.current.addImage("custom-marker", image);

        mapRef.current.addSource("ports", {
          type: "geojson",
          data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson",
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        mapRef.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "ports",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              100,
              "#f1f075",
              750,
              "#f28cb1",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        });

        mapRef.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "ports",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });

        mapRef.current.addLayer({
          id: "unclustered-point",
          type: "symbol",
          source: "ports",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": "custom-marker",
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
          },
        });

        mapRef.current.on("click", "clusters", (e) => {
          const features = mapRef.current.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          const clusterId = features[0].properties.cluster_id;
          mapRef.current
            .getSource("ports")
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;

              mapRef.current.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
              });
            });
        });

        mapRef.current.on("click", "unclustered-point", (e) => {
          const { website, scalerank, natlscale, name, featureclass } =
            e.features[0].properties;
          const coordinates = e.features[0].geometry.coordinates.slice();

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `Name: ${name}<br/>Type: ${featureclass}<br/>Scalerank: ${scalerank}<br/>Natlscale: ${natlscale}<br/>Website: <a href="https://${website}" target="_blank">${website || "none"}</a>`,
            )
            .addTo(mapRef.current);
        });

        mapRef.current.on("mouseenter", "clusters", () => {
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseenter", "unclustered-point", () => {
          mapRef.current.getCanvas().style.cursor = "pointer";
        });
        mapRef.current.on("mouseleave", "clusters", () => {
          mapRef.current.getCanvas().style.cursor = "";
        });
        mapRef.current.on("mouseleave", "unclustered-point", () => {
          mapRef.current.getCanvas().style.cursor = "";
        });
      });

      let origin = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [-123.071437, 49.29777778],
        },
      };

      let destination = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [-0.318433451, 39.44416667],
        },
      };

      let route = seaRoute(origin, destination);
      //let routeMiles = seaRoute(origin, destination, "miles");

      mapRef.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.geometry.coordinates,
          },
        },
      });

      mapRef.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "red",
          "line-width": 4,
        },
      });
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const handleButtonClick = () => {
    mapRef.current.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });
  };

  return (
    <>
      <div className="search-wrapper">
        <input
          type="text"
          className="search"
          placeholder="Search"
          onChange={(e) => handleSearch(e.target.value)}
        />
        <div className="search-dropdown">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="search-dropdown-item"
              onClick={() => handleSearchResultClick(result)}
            >
              {result.properties.name}
            </div>
          ))}
        </div>
      </div>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(2)} |
        Zoom: {zoom.toFixed(2)}
      </div>
      <button className="reset-button" onClick={handleButtonClick}>
        Reset
      </button>
      <div id="map-container" ref={mapContainerRef}></div>
    </>
  );
};

export default Map;
