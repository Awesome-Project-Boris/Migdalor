import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Modal,
  Button,
  Platform,
  Alert,
  Linking,
} from "react-native";

import MapView, {
  PROVIDER_GOOGLE,
  Polygon,
  Marker,
  Polyline,
} from "react-native-maps";

import * as Location from "expo-location";
import pointInPolygon from "point-in-polygon";
import FlipButton from "@/components/FlipButton";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;

const INITIAL_LATITUDE_DELTA = 0.0049;
const INITIAL_LONGITUDE_DELTA = INITIAL_LATITUDE_DELTA * ASPECT_RATIO;
const MAP_CENTER_LATITUDE = 32.310441;
const MAP_CENTER_LONGITUDE = 34.895219;

const mapNodes = [
  { id: 1, coords: "32.309722, 34.895251", Description: "Map_Pin10" }, // grasslands and water fountain ( B71 )
  { id: 2, coords: "32.309750, 34.895035" },
  { id: 3, coords: "32.309747, 34.894634" },
  { id: 4, coords: "32.309750, 34.894447" },
  { id: 5, coords: "32.309818, 34.895326" },
  { id: 6, coords: "32.309999, 34.895159" },
  { id: 7, coords: "32.310278, 34.894875" },
  { id: 8, coords: "32.310445, 34.894731" },
  { id: 9, coords: "32.310346, 34.894651" },
  { id: 10, coords: "32.310496, 34.894825" },
  { id: 11, coords: "32.309563, 34.895390", Description: "Map_Pin7" }, // gym ( B1 )
  { id: 12, coords: "32.309354, 34.895396", Description: "Map_Pin12" }, // Tavor building 1151-1354
  { id: 13, coords: "32.308981, 34.895382" },
  { id: 14, coords: "32.308796, 34.895373" },
  { id: 15, coords: "32.309837, 34.895403" },
  { id: 16, coords: "32.310092, 34.895416" },
  { id: 17, coords: "32.310435, 34.895417" },
  { id: 18, coords: "32.310623, 34.895429" },
  { id: 19, coords: "32.310824, 34.895429" },
  { id: 20, coords: "32.310990, 34.895439" },
  { id: 21, coords: "32.311185, 34.895436" },
  { id: 22, coords: "32.311536, 34.895443" },
  { id: 23, coords: "32.311592, 34.895359" },
  { id: 24, coords: "32.311725, 34.895195" },
  { id: 25, coords: "32.311771, 34.894944" },
  { id: 26, coords: "32.311731, 34.894781" },
  { id: 27, coords: "32.311547, 34.894774" },
  { id: 28, coords: "32.311429, 34.894771" },
  { id: 29, coords: "32.311183, 34.894761" },
  { id: 30, coords: "32.311039, 34.894761" },
  { id: 31, coords: "32.310832, 34.894744" },
  { id: 32, coords: "32.311556, 34.895576" },
  { id: 33, coords: "32.311556, 34.895827" },
  { id: 34, coords: "32.311542, 34.895974" },
  { id: 35, coords: "32.311409, 34.895968" },
  { id: 36, coords: "32.311252, 34.895979" },
  { id: 37, coords: "32.311154, 34.895966" },
  { id: 38, coords: "32.310977, 34.895949" },
  { id: 39, coords: "32.310982, 34.895819" },
  { id: 40, coords: "32.310990, 34.895593" },
  { id: 41, coords: "32.310848, 34.895284" },
  { id: 42, coords: "32.310909, 34.895069" },
  { id: 43, coords: "32.310983, 34.894895" },
  { id: 44, coords: "32.311229, 34.895287" },
  { id: 45, coords: "32.311301, 34.895115" },
  { id: 46, coords: "32.311376, 34.894984" },
  { id: 47, coords: "32.311486, 34.894847" },
  { id: 48, coords: "32.311167, 34.895594" },
  { id: 49, coords: "32.311161, 34.895807" },
  { id: 50, coords: "32.310435, 34.895285" },
  { id: 51, coords: "32.310416, 34.895108" },
  { id: 52, coords: "32.310348, 34.894969" },
  { id: 53, coords: "32.310184, 34.894785" },
  { id: 54, coords: "32.310021, 34.894691" },
  { id: 55, coords: "32.309843, 34.894643" },
  { id: 56, coords: "32.309626, 34.894643" },
  { id: 57, coords: "32.309440, 34.894678" },
  { id: 58, coords: "32.309305, 34.894767" },
  { id: 59, coords: "32.309215, 34.894852" },
  { id: 60, coords: "32.309092, 34.894710" },
  { id: 61, coords: "32.309184, 34.894623" },
  { id: 62, coords: "32.309002, 34.894827" },
  { id: 63, coords: "32.309119, 34.894955" },
  { id: 64, coords: "32.309037, 34.895099" },
  { id: 65, coords: "32.308993, 34.895257" },
  { id: 66, coords: "32.308981, 34.895519" },
  { id: 67, coords: "32.308985, 34.895734" },
  { id: 68, coords: "32.308979, 34.895869" },
  { id: 69, coords: "32.310097, 34.895319" },
  { id: 70, coords: "32.310056, 34.895225" },
  { id: 71, coords: "32.309932, 34.895079" },
  { id: 72, coords: "32.309824, 34.895035" },
  { id: 73, coords: "32.309643, 34.895010" },
  { id: 74, coords: "32.309498, 34.895069" },
  { id: 75, coords: "32.309440, 34.895127" },
  { id: 76, coords: "32.309390, 34.895193" },
  { id: 77, coords: "32.309341, 34.895317" },
  { id: 78, coords: "32.309339, 34.895528" },
  { id: 79, coords: "32.309336, 34.895734" },
  { id: 80, coords: "32.309330, 34.895887" },
  { id: 81, coords: "32.308779, 34.895842" },
  { id: 82, coords: "32.308764, 34.895713" },
  { id: 83, coords: "32.308786, 34.895519" },
  { id: 84, coords: "32.308815, 34.895212" },
  { id: 85, coords: "32.308849, 34.894776" },
  { id: 86, coords: "32.308896, 34.894469" },
  { id: 87, coords: "32.308983, 34.894410" },
  { id: 88, coords: "32.309140, 34.894407" },
  { id: 89, coords: "32.309661, 34.894435" },
  { id: 90, coords: "32.309856, 34.894433" },
  { id: 91, coords: "32.310364, 34.894458" },
  { id: 92, coords: "32.310667, 34.894481" },
  { id: 93, coords: "32.310647, 34.894735" },
  { id: 94, coords: "32.310647, 34.894735" },
  { id: 95, coords: "32.310623, 34.895429" }, // FROM HERE ON OUT - INFO!
  { id: 96, coords: "32.310140, 34.895695", Description: "Map_Pin1" }, // 1st floor ent, reception, resident service, lobby, cafeteria - on to apts and grass
  { id: 97, coords: "32.309943, 34.895583", Description: "Map_Pin2" }, // 0stfloor resturaunt, אולם אירועים, barber shop, laundromat, creativity classes, exit to pool and gym
  { id: 98, coords: "32.310223, 34.895552", Description: "Map_Pin3" }, // building B1 apts 101-120, 201-220, 301-332, 401-432
  { id: 99, coords: "32.310838, 34.895509", Description: "Map_Pin4" }, // Building B2 apts 131-149, 231-249, 331-349, 431-449
  { id: 100, coords: "32.310087, 34.895470", Description: "Map_Pin5" }, // 0st floor - infirmary and the hall of many occasions
  { id: 101, coords: "32.310235, 34.895695", Description: "Map_Pin6" }, // 2nd floor - studio, synagouge, library, small lecture hall/room

  { id: 102, coords: "32.309535, 34.895853", Description: "Map_Pin8" }, // pool ( B70 )

  { id: 103, coords: "32.310934, 34.895481", Description: "Map_Pin11" }, // entrance to B2 - down to gallery and tunnel to B67, B68, B69
  { id: 104, coords: "32.310895, 34.894612", Description: "Map_Pin12" }, // Tavor building 1151-1354
  { id: 105, coords: "32.311279, 34.894629", Description: "Map_Pin13" }, // Carmel building 2151-2354
  { id: 106, coords: "32.311588, 34.894638", Description: "Map_Pin14" }, // Gilboa building 3151 -3354
  { id: 107, coords: "32.311710, 34.895507", Description: "Map_Pin15" }, // Oak place and Pétanque count ( B72 )
  { id: 108, coords: "32.310581, 34.895520", Description: "Map_Pin16" }, // passage between B1 - B2 ( floors 0,1,2 )
  { id: 109, coords: "32.310604, 34.895641", Description: "Map_Pin17" }, // Minimarket
  { id: 110, coords: "32.310669, 34.895594", Description: "Map_Pin18" }, // B2 entrance
  { id: 111, coords: "32.311243, 34.896109", Description: "Map_Pin19" }, // Entrance and armed guardian

  // Roads
  { id: 112, coords: "32.311246, 34.896106" }, // point 1
  { id: 113, coords: "32.311297, 34.895976" }, // point 2
  { id: 114, coords: "32.311642, 34.895955" }, // point 3
  { id: 115, coords: "32.311902, 34.895444" }, // point 4
  { id: 116, coords: "32.311760, 34.894841" }, // point 5
  { id: 117, coords: "32.310238, 34.896034" }, // point 6
  { id: 118, coords: "32.310168, 34.895851" }, // point 7
  { id: 119, coords: "32.310040, 34.895963" }, // point 8
  { id: 120, coords: "32.309426, 34.895888" }, // point 9
  { id: 121, coords: "32.309259, 34.895894" }, // point 10
  { id: 122, coords: "32.308741, 34.895856" }, // point 11
  { id: 123, coords: "32.308869, 34.894392" }, // point 12
  { id: 124, coords: "32.310668, 34.894426" }, // point 13
  { id: 125, coords: "32.311778, 34.894467" }, // point 14
  { id: 126, coords: "32.311800, 34.894701" }, // point 15
  { id: 127, coords: "32.310657, 34.895346" }, // point 16
];

const vertices = [
  { id: 1, pair: [1, 2] },
  { id: 2, pair: [2, 3] },
  { id: 3, pair: [3, 4] },
  { id: 4, pair: [1, 5] },
  { id: 5, pair: [5, 6] },
  { id: 6, pair: [6, 7] },
  { id: 7, pair: [7, 8] },
  { id: 8, pair: [8, 9] },
  { id: 9, pair: [8, 10] },
  { id: 10, pair: [1, 11] },
  { id: 11, pair: [11, 12] },
  { id: 12, pair: [12, 13] },
  { id: 13, pair: [13, 14] },
  { id: 14, pair: [5, 15] },
  { id: 15, pair: [15, 16] },
  { id: 16, pair: [16, 17] },
  { id: 17, pair: [17, 18] },
  { id: 18, pair: [18, 19] },
  { id: 19, pair: [19, 20] },
  { id: 20, pair: [20, 21] },
  { id: 21, pair: [21, 21] },
  { id: 22, pair: [22, 23] },
  { id: 23, pair: [23, 24] },
  { id: 24, pair: [24, 25] },
  { id: 25, pair: [25, 26] },
  { id: 26, pair: [26, 27] },
  { id: 27, pair: [27, 28] },
  { id: 28, pair: [28, 29] },
  { id: 29, pair: [29, 30] },
  { id: 30, pair: [30, 31] }, /////
  { id: 31, pair: [22, 32] },
  { id: 32, pair: [32, 33] },
  { id: 33, pair: [33, 34] },
  { id: 34, pair: [34, 35] },
  { id: 35, pair: [35, 36] },
  { id: 36, pair: [36, 37] },
  { id: 37, pair: [37, 38] },
  { id: 38, pair: [38, 39] },
  { id: 39, pair: [39, 40] },
  { id: 40, pair: [40, 20] }, ///
  { id: 41, pair: [19, 41] },
  { id: 42, pair: [41, 42] },
  { id: 43, pair: [42, 43] },
  { id: 44, pair: [43, 30] },
  { id: 45, pair: [21, 44] },
  { id: 46, pair: [44, 45] },
  { id: 47, pair: [45, 46] },
  { id: 48, pair: [46, 47] },
  { id: 49, pair: [47, 27] },
  { id: 50, pair: [21, 48] },
  { id: 51, pair: [48, 49] },
  { id: 52, pair: [49, 37] },
  { id: 53, pair: [17, 50] },
  { id: 54, pair: [50, 51] },
  { id: 55, pair: [51, 52] },
  { id: 56, pair: [52, 7] },
  { id: 57, pair: [7, 53] },
  { id: 58, pair: [53, 54] },
  { id: 59, pair: [54, 55] },
  { id: 60, pair: [55, 3] },
  { id: 61, pair: [3, 56] },
  { id: 62, pair: [56, 57] },
  { id: 63, pair: [57, 58] },
  { id: 64, pair: [58, 59] },
  { id: 65, pair: [59, 60] },
  { id: 66, pair: [60, 61] },
  { id: 67, pair: [60, 62] },
  { id: 68, pair: [59, 63] },
  { id: 69, pair: [63, 64] },
  { id: 70, pair: [64, 65] },
  { id: 71, pair: [65, 13] },
  { id: 72, pair: [13, 66] },
  { id: 73, pair: [66, 67] },
  { id: 74, pair: [67, 68] },
  { id: 75, pair: [16, 69] },
  { id: 76, pair: [69, 70] },
  { id: 77, pair: [70, 6] },
  { id: 78, pair: [6, 71] },
  { id: 79, pair: [71, 72] },
  { id: 80, pair: [72, 2] },
  { id: 81, pair: [2, 73] },
  { id: 82, pair: [73, 74] },
  { id: 83, pair: [74, 75] },
  { id: 84, pair: [75, 76] },
  { id: 85, pair: [76, 77] },
  { id: 86, pair: [77, 12] },
  { id: 87, pair: [12, 78] },
  { id: 88, pair: [78, 79] },
  { id: 89, pair: [79, 80] },
  { id: 90, pair: [80, 68] },
  { id: 91, pair: [68, 81] },
  { id: 92, pair: [81, 82] },
  { id: 93, pair: [82, 83] },
  { id: 94, pair: [83, 14] },
  { id: 95, pair: [14, 84] },
  { id: 96, pair: [85, 85] },
  { id: 97, pair: [85, 86] },
  { id: 98, pair: [86, 87] },
  { id: 99, pair: [87, 88] },
  { id: 100, pair: [88, 89] },
  { id: 101, pair: [89, 4] },
  { id: 102, pair: [4, 90] },
  { id: 103, pair: [90, 91] },
  { id: 104, pair: [91, 92] },
  { id: 105, pair: [92, 94] },
  { id: 106, pair: [94, 18] },
  { id: 107, pair: [112, 113] }, // Road nodes
  { id: 108, pair: [113, 114] },
  { id: 109, pair: [114, 115] },
  { id: 110, pair: [115, 116] },
  { id: 111, pair: [112, 117] },
  { id: 112, pair: [117, 118] },
  { id: 113, pair: [118, 119] },
  { id: 114, pair: [119, 120] },
  { id: 115, pair: [121, 122] },
  { id: 116, pair: [122, 123] },
  { id: 117, pair: [123, 124] },
  { id: 118, pair: [124, 125] },
  { id: 119, pair: [125, 126] },
  { id: 120, pair: [124, 127] },
];

const polylines = [
  [
    { latitude: 32.308815, longitude: 34.895212 },
    { latitude: 32.308849, longitude: 34.894776 },
  ],
  [
    { latitude: 32.310832, longitude: 34.894744 },
    { latitude: 32.310647, longitude: 34.894735 },
  ],
  [
    { latitude: 32.309722, longitude: 34.895251 },
    { latitude: 32.30975, longitude: 34.895035 },
  ],
  [
    { latitude: 32.30975, longitude: 34.895035 },
    { latitude: 32.309747, longitude: 34.894634 },
  ],
  [
    { latitude: 32.309747, longitude: 34.894634 },
    { latitude: 32.30975, longitude: 34.894447 },
  ],
  [
    { latitude: 32.309722, longitude: 34.895251 },
    { latitude: 32.309818, longitude: 34.895326 },
  ],
  [
    { latitude: 32.309818, longitude: 34.895326 },
    { latitude: 32.309999, longitude: 34.895159 },
  ],
  [
    { latitude: 32.309999, longitude: 34.895159 },
    { latitude: 32.310278, longitude: 34.894875 },
  ],
  [
    { latitude: 32.310278, longitude: 34.894875 },
    { latitude: 32.310445, longitude: 34.894731 },
  ],
  [
    { latitude: 32.310445, longitude: 34.894731 },
    { latitude: 32.310346, longitude: 34.894651 },
  ],
  [
    { latitude: 32.310445, longitude: 34.894731 },
    { latitude: 32.310496, longitude: 34.894825 },
  ],
  [
    { latitude: 32.309722, longitude: 34.895251 },
    { latitude: 32.309563, longitude: 34.89539 },
  ],
  [
    { latitude: 32.309563, longitude: 34.89539 },
    { latitude: 32.309354, longitude: 34.895396 },
  ],
  [
    { latitude: 32.309354, longitude: 34.895396 },
    { latitude: 32.308981, longitude: 34.895382 },
  ],
  [
    { latitude: 32.308981, longitude: 34.895382 },
    { latitude: 32.308796, longitude: 34.895373 },
  ],
  [
    { latitude: 32.309818, longitude: 34.895326 },
    { latitude: 32.309837, longitude: 34.895403 },
  ],
  [
    { latitude: 32.309837, longitude: 34.895403 },
    { latitude: 32.310092, longitude: 34.895416 },
  ],
  [
    { latitude: 32.310092, longitude: 34.895416 },
    { latitude: 32.310405, longitude: 34.895419 },
  ],
  [
    { latitude: 32.310405, longitude: 34.895419 },
    { latitude: 32.310623, longitude: 34.895429 },
  ],
  [
    { latitude: 32.310623, longitude: 34.895429 },
    { latitude: 32.310824, longitude: 34.895429 },
  ],
  [
    { latitude: 32.310824, longitude: 34.895429 },
    { latitude: 32.31099, longitude: 34.895439 },
  ],
  [
    { latitude: 32.31099, longitude: 34.895439 },
    { latitude: 32.311185, longitude: 34.895436 },
  ],
  [
    { latitude: 32.311185, longitude: 34.895436 },
    { latitude: 32.311185, longitude: 34.895436 },
  ],
  [
    { latitude: 32.311536, longitude: 34.895443 },
    { latitude: 32.311592, longitude: 34.895359 },
  ],
  [
    { latitude: 32.311592, longitude: 34.895359 },
    { latitude: 32.311725, longitude: 34.895195 },
  ],
  [
    { latitude: 32.311725, longitude: 34.895195 },
    { latitude: 32.311771, longitude: 34.894944 },
  ],
  [
    { latitude: 32.311771, longitude: 34.894944 },
    { latitude: 32.311731, longitude: 34.894781 },
  ],
  [
    { latitude: 32.311731, longitude: 34.894781 },
    { latitude: 32.311547, longitude: 34.894774 },
  ],
  [
    { latitude: 32.311547, longitude: 34.894774 },
    { latitude: 32.311429, longitude: 34.894771 },
  ],
  [
    { latitude: 32.311429, longitude: 34.894771 },
    { latitude: 32.311183, longitude: 34.894761 },
  ],
  [
    { latitude: 32.311183, longitude: 34.894761 },
    { latitude: 32.311039, longitude: 34.894761 },
  ],
  [
    { latitude: 32.311039, longitude: 34.894761 },
    { latitude: 32.310832, longitude: 34.894744 },
  ],
  [
    { latitude: 32.311536, longitude: 34.895443 },
    { latitude: 32.311556, longitude: 34.895576 },
  ],
  [
    { latitude: 32.311556, longitude: 34.895576 },
    { latitude: 32.311556, longitude: 34.895827 },
  ],
  [
    { latitude: 32.311556, longitude: 34.895827 },
    { latitude: 32.311542, longitude: 34.895974 },
  ],
  [
    { latitude: 32.311542, longitude: 34.895974 },
    { latitude: 32.311409, longitude: 34.895968 },
  ],
  [
    { latitude: 32.311409, longitude: 34.895968 },
    { latitude: 32.311252, longitude: 34.895979 },
  ],
  [
    { latitude: 32.311252, longitude: 34.895979 },
    { latitude: 32.311154, longitude: 34.895966 },
  ],
  [
    { latitude: 32.311154, longitude: 34.895966 },
    { latitude: 32.310977, longitude: 34.89595 },
  ],
  [
    { latitude: 32.310977, longitude: 34.89595 },
    { latitude: 32.310982, longitude: 34.895819 },
  ],
  [
    { latitude: 32.310982, longitude: 34.895819 },
    { latitude: 32.31099, longitude: 34.895593 },
  ],
  [
    { latitude: 32.31099, longitude: 34.895593 },
    { latitude: 32.31099, longitude: 34.895439 },
  ],
  [
    { latitude: 32.310824, longitude: 34.895429 },
    { latitude: 32.310848, longitude: 34.895284 },
  ],
  [
    { latitude: 32.310848, longitude: 34.895284 },
    { latitude: 32.310909, longitude: 34.895069 },
  ],
  [
    { latitude: 32.310909, longitude: 34.895069 },
    { latitude: 32.310983, longitude: 34.894895 },
  ],
  [
    { latitude: 32.310983, longitude: 34.894895 },
    { latitude: 32.311039, longitude: 34.894761 },
  ],
  [
    { latitude: 32.311185, longitude: 34.895436 },
    { latitude: 32.311229, longitude: 34.895287 },
  ],
  [
    { latitude: 32.311229, longitude: 34.895287 },
    { latitude: 32.311301, longitude: 34.895115 },
  ],
  [
    { latitude: 32.311301, longitude: 34.895115 },
    { latitude: 32.311376, longitude: 34.894984 },
  ],
  [
    { latitude: 32.311376, longitude: 34.894984 },
    { latitude: 32.311486, longitude: 34.894847 },
  ],
  [
    { latitude: 32.311486, longitude: 34.894847 },
    { latitude: 32.311547, longitude: 34.894774 },
  ],
  [
    { latitude: 32.311185, longitude: 34.895436 },
    { latitude: 32.311167, longitude: 34.895594 },
  ],
  [
    { latitude: 32.311167, longitude: 34.895594 },
    { latitude: 32.311161, longitude: 34.895807 },
  ],
  [
    { latitude: 32.311161, longitude: 34.895807 },
    { latitude: 32.311154, longitude: 34.895966 },
  ],
  [
    { latitude: 32.310405, longitude: 34.895419 },
    { latitude: 32.310435, longitude: 34.895285 },
  ],
  [
    { latitude: 32.310435, longitude: 34.895285 },
    { latitude: 32.310416, longitude: 34.895108 },
  ],
  [
    { latitude: 32.310416, longitude: 34.895108 },
    { latitude: 32.310348, longitude: 34.894969 },
  ],
  [
    { latitude: 32.310348, longitude: 34.894969 },
    { latitude: 32.310278, longitude: 34.894875 },
  ],
  [
    { latitude: 32.310278, longitude: 34.894875 },
    { latitude: 32.310184, longitude: 34.894785 },
  ],
  [
    { latitude: 32.310184, longitude: 34.894785 },
    { latitude: 32.310021, longitude: 34.894691 },
  ],
  [
    { latitude: 32.310021, longitude: 34.894691 },
    { latitude: 32.309843, longitude: 34.894643 },
  ],
  [
    { latitude: 32.309843, longitude: 34.894643 },
    { latitude: 32.309747, longitude: 34.894634 },
  ],
  [
    { latitude: 32.309747, longitude: 34.894634 },
    { latitude: 32.309626, longitude: 34.894643 },
  ],
  [
    { latitude: 32.309626, longitude: 34.894643 },
    { latitude: 32.30944, longitude: 34.894678 },
  ],
  [
    { latitude: 32.30944, longitude: 34.894678 },
    { latitude: 32.309305, longitude: 34.894767 },
  ],
  [
    { latitude: 32.309305, longitude: 34.894767 },
    { latitude: 32.309215, longitude: 34.894852 },
  ],
  [
    { latitude: 32.309215, longitude: 34.894852 },
    { latitude: 32.309092, longitude: 34.89471 },
  ],
  [
    { latitude: 32.309092, longitude: 34.89471 },
    { latitude: 32.309184, longitude: 34.894623 },
  ],
  [
    { latitude: 32.309092, longitude: 34.89471 },
    { latitude: 32.309002, longitude: 34.894827 },
  ],
  [
    { latitude: 32.309215, longitude: 34.894852 },
    { latitude: 32.309119, longitude: 34.894955 },
  ],
  [
    { latitude: 32.309119, longitude: 34.894955 },
    { latitude: 32.309037, longitude: 34.895099 },
  ],
  [
    { latitude: 32.309037, longitude: 34.895099 },
    { latitude: 32.308993, longitude: 34.895257 },
  ],
  [
    { latitude: 32.308993, longitude: 34.895257 },
    { latitude: 32.308981, longitude: 34.895382 },
  ],
  [
    { latitude: 32.308981, longitude: 34.895382 },
    { latitude: 32.308981, longitude: 34.895519 },
  ],
  [
    { latitude: 32.308981, longitude: 34.895519 },
    { latitude: 32.308985, longitude: 34.895734 },
  ],
  [
    { latitude: 32.308985, longitude: 34.895734 },
    { latitude: 32.308979, longitude: 34.895869 },
  ],
  [
    { latitude: 32.310092, longitude: 34.895416 },
    { latitude: 32.310097, longitude: 34.895319 },
  ],
  [
    { latitude: 32.310097, longitude: 34.895319 },
    { latitude: 32.310056, longitude: 34.895225 },
  ],
  [
    { latitude: 32.310056, longitude: 34.895225 },
    { latitude: 32.309999, longitude: 34.895159 },
  ],
  [
    { latitude: 32.309999, longitude: 34.895159 },
    { latitude: 32.309932, longitude: 34.895079 },
  ],
  [
    { latitude: 32.309932, longitude: 34.895079 },
    { latitude: 32.309824, longitude: 34.895035 },
  ],
  [
    { latitude: 32.309824, longitude: 34.895035 },
    { latitude: 32.30975, longitude: 34.895035 },
  ],
  [
    { latitude: 32.30975, longitude: 34.895035 },
    { latitude: 32.309643, longitude: 34.89501 },
  ],
  [
    { latitude: 32.309643, longitude: 34.89501 },
    { latitude: 32.309498, longitude: 34.895069 },
  ],
  [
    { latitude: 32.309498, longitude: 34.895069 },
    { latitude: 32.30944, longitude: 34.895127 },
  ],
  [
    { latitude: 32.30944, longitude: 34.895127 },
    { latitude: 32.30939, longitude: 34.895193 },
  ],
  [
    { latitude: 32.30939, longitude: 34.895193 },
    { latitude: 32.309341, longitude: 34.895317 },
  ],
  [
    { latitude: 32.309341, longitude: 34.895317 },
    { latitude: 32.309354, longitude: 34.895396 },
  ],
  [
    { latitude: 32.309354, longitude: 34.895396 },
    { latitude: 32.309339, longitude: 34.895528 },
  ],
  [
    { latitude: 32.309339, longitude: 34.895528 },
    { latitude: 32.309336, longitude: 34.895734 },
  ],
  [
    { latitude: 32.309336, longitude: 34.895734 },
    { latitude: 32.30933, longitude: 34.895887 },
  ],
  [
    { latitude: 32.30933, longitude: 34.895887 },
    { latitude: 32.308979, longitude: 34.895869 },
  ],
  [
    { latitude: 32.308979, longitude: 34.895869 },
    { latitude: 32.308779, longitude: 34.895842 },
  ],
  [
    { latitude: 32.308779, longitude: 34.895842 },
    { latitude: 32.308764, longitude: 34.895713 },
  ],
  [
    { latitude: 32.308764, longitude: 34.895713 },
    { latitude: 32.308786, longitude: 34.895519 },
  ],
  [
    { latitude: 32.308786, longitude: 34.895519 },
    { latitude: 32.308796, longitude: 34.895373 },
  ],
  [
    { latitude: 32.308796, longitude: 34.895373 },
    { latitude: 32.308815, longitude: 34.895212 },
  ],
  [
    { latitude: 32.308849, longitude: 34.894776 },
    { latitude: 32.308849, longitude: 34.894776 },
  ],
  [
    { latitude: 32.308849, longitude: 34.894776 },
    { latitude: 32.308896, longitude: 34.894469 },
  ],
  [
    { latitude: 32.308896, longitude: 34.894469 },
    { latitude: 32.308983, longitude: 34.89441 },
  ],
  [
    { latitude: 32.308983, longitude: 34.89441 },
    { latitude: 32.30914, longitude: 34.894407 },
  ],
  [
    { latitude: 32.30914, longitude: 34.894407 },
    { latitude: 32.309661, longitude: 34.894435 },
  ],
  [
    { latitude: 32.309661, longitude: 34.894435 },
    { latitude: 32.30975, longitude: 34.894447 },
  ],
  [
    { latitude: 32.30975, longitude: 34.894447 },
    { latitude: 32.309856, longitude: 34.894433 },
  ],
  [
    { latitude: 32.309856, longitude: 34.894433 },
    { latitude: 32.310364, longitude: 34.894458 },
  ],
  [
    { latitude: 32.310364, longitude: 34.894458 },
    { latitude: 32.310667, longitude: 34.894481 },
  ],
  [
    { latitude: 32.310667, longitude: 34.894481 },
    { latitude: 32.310647, longitude: 34.894735 },
  ],
  [
    { latitude: 32.310647, longitude: 34.894735 },
    { latitude: 32.310623, longitude: 34.895429 },
  ],
  // UNDERGROUND TUNNEL
  {
    isUnderground: true,
    coordinates: [
      { latitude: 32.310934, longitude: 34.895481 }, // node 103
      { latitude: 32.311183, longitude: 34.894761 }, // node 29
    ],
  },
];

const normalizedLines = polylines.map((seg) =>
  Array.isArray(seg)
    ? { isArrow: false, isUnderground: seg.isUnderground, coordinates: seg }
    : seg
);

const roadPolylines = [
  //////////////// ROADS
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.311246, longitude: 34.896106 },
      { latitude: 32.311297, longitude: 34.895976 },
    ],
  },
  // 108: 113 → 114
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.311297, longitude: 34.895976 },
      { latitude: 32.311642, longitude: 34.895955 },
    ],
  },
  // 109: 114 → 115
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.311642, longitude: 34.895955 },
      { latitude: 32.311902, longitude: 34.895444 },
    ],
  },
  // 110: 115 → 116
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.311902, longitude: 34.895444 },
      { latitude: 32.31176, longitude: 34.894841 },
    ],
  },
  // 111: 112 → 117
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.311246, longitude: 34.896106 },
      { latitude: 32.310238, longitude: 34.896034 },
    ],
  },
  // 112: 117 → 118
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.310238, longitude: 34.896034 },
      { latitude: 32.310168, longitude: 34.895851 },
    ],
  },
  // 113: 118 → 119
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.310168, longitude: 34.895851 },
      { latitude: 32.31004, longitude: 34.895963 },
    ],
  },
  // 114: 119 → 120
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.31004, longitude: 34.895963 },
      { latitude: 32.309426, longitude: 34.895888 },
    ],
  },
  // 115: 121 → 122
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.309259, longitude: 34.895894 },
      { latitude: 32.308741, longitude: 34.895856 },
    ],
  },
  // 116: 122 → 123
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.308741, longitude: 34.895856 },
      { latitude: 32.308869, longitude: 34.894392 },
    ],
  },
  // 117: 123 → 124
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.308869, longitude: 34.894392 },
      { latitude: 32.310668, longitude: 34.894426 },
    ],
  },
  // 118: 124 → 125
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.310668, longitude: 34.894426 },
      { latitude: 32.311778, longitude: 34.894467 },
    ],
  },
  // 119: 125 → 126
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.311778, longitude: 34.894467 },
      { latitude: 32.3118, longitude: 34.894701 },
    ],
  },
  // 120: 124 → 127
  {
    isRoad: true,
    coordinates: [
      { latitude: 32.310668, longitude: 34.894426 },
      { latitude: 32.310657, longitude: 34.895346 },
    ],
  },
];

const arrowPolylines = [
  // DEAD END ARROW POLYLINES

  {
    isArrow: true,
    coordinates: [
      { latitude: 32.309484, longitude: 34.894239 },
      { latitude: 32.309325, longitude: 34.894239 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.309484, longitude: 34.894239 },
      { latitude: 32.30943, longitude: 34.89417 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.309484, longitude: 34.894239 },
      { latitude: 32.309432, longitude: 34.894322 },
    ],
  },

  // west arrow
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.31115, longitude: 34.894322 },
      { latitude: 32.310848, longitude: 34.894319 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.31115, longitude: 34.894322 },
      { latitude: 32.311063, longitude: 34.894241 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.31115, longitude: 34.894322 },
      { latitude: 32.31107, longitude: 34.894397 },
    ],
  },

  // north‑north‑west arrow
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311882, longitude: 34.894686 },
      { latitude: 32.311917, longitude: 34.894445 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311882, longitude: 34.894686 },
      { latitude: 32.311938, longitude: 34.894633 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311882, longitude: 34.894686 },
      { latitude: 32.311835, longitude: 34.894631 },
    ],
  },

  // north‑west double way + block
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311989, longitude: 34.894732 },
      { latitude: 32.311841, longitude: 34.894729 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311957, longitude: 34.894815 },
      { latitude: 32.31195, longitude: 34.895029 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311957, longitude: 34.894815 },
      { latitude: 32.311914, longitude: 34.894876 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311957, longitude: 34.894815 },
      { latitude: 32.312016, longitude: 34.894879 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311871, longitude: 34.895029 },
      { latitude: 32.311875, longitude: 34.894766 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311871, longitude: 34.895029 },
      { latitude: 32.311921, longitude: 34.894968 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311871, longitude: 34.895029 },
      { latitude: 32.311821, longitude: 34.894968 },
    ],
  },

  // north‑north‑east two‑way
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.31194, longitude: 34.895709 },
      { latitude: 32.311879, longitude: 34.895881 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.31194, longitude: 34.895709 },
      { latitude: 32.311885, longitude: 34.895744 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.31194, longitude: 34.895709 },
      { latitude: 32.311934, longitude: 34.895772 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311792, longitude: 34.895839 },
      { latitude: 32.311865, longitude: 34.895663 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311792, longitude: 34.895839 },
      { latitude: 32.311849, longitude: 34.895807 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.311792, longitude: 34.895839 },
      { latitude: 32.311795, longitude: 34.895775 },
    ],
  },

  // entrance arrows
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310594, longitude: 34.896147 },
      { latitude: 32.310493, longitude: 34.896134 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310594, longitude: 34.896147 },
      { latitude: 32.310548, longitude: 34.896102 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310594, longitude: 34.896147 },
      { latitude: 32.310546, longitude: 34.896175 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310489, longitude: 34.896215 },
      { latitude: 32.310637, longitude: 34.896235 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310489, longitude: 34.896215 },
      { latitude: 32.310527, longitude: 34.896245 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310489, longitude: 34.896215 },
      { latitude: 32.310532, longitude: 34.896174 },
    ],
  },

  // roundabout arrows
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310178, longitude: 34.895879 },
      { latitude: 32.310267, longitude: 34.895977 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310178, longitude: 34.895879 },
      { latitude: 32.31017, longitude: 34.895945 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310178, longitude: 34.895879 },
      { latitude: 32.310246, longitude: 34.89588 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310054, longitude: 34.895928 },
      { latitude: 32.310128, longitude: 34.895839 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310054, longitude: 34.895928 },
      { latitude: 32.310099, longitude: 34.895903 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.310054, longitude: 34.895928 },
      { latitude: 32.310064, longitude: 34.895878 },
    ],
  },

  // pool two‑way + block
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.309377, longitude: 34.895854 },
      { latitude: 32.30938, longitude: 34.895959 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.30942, longitude: 34.895977 },
      { latitude: 32.309565, longitude: 34.895973 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.30942, longitude: 34.895977 },
      { latitude: 32.309456, longitude: 34.896009 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.30942, longitude: 34.895977 },
      { latitude: 32.309462, longitude: 34.89593 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.309577, longitude: 34.896055 },
      { latitude: 32.309438, longitude: 34.896054 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.309577, longitude: 34.896055 },
      { latitude: 32.309548, longitude: 34.896013 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.309577, longitude: 34.896055 },
      { latitude: 32.309552, longitude: 34.896087 },
    ],
  },

  // south‑eastern downwards arrow
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.308899, longitude: 34.895999 },
      { latitude: 32.309143, longitude: 34.895994 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.308899, longitude: 34.895999 },
      { latitude: 32.308948, longitude: 34.896034 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.308899, longitude: 34.895999 },
      { latitude: 32.308951, longitude: 34.895945 },
    ],
  },

  // south arrow towards west
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.308719, longitude: 34.894913 },
      { latitude: 32.308717, longitude: 34.895144 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.308719, longitude: 34.894913 },
      { latitude: 32.308674, longitude: 34.894976 },
    ],
  },
  {
    isArrow: true,
    coordinates: [
      { latitude: 32.308719, longitude: 34.894913 },
      { latitude: 32.308759, longitude: 34.894978 },
    ],
  },
];

const allSegments = [
  ...roadPolylines, // roads beneath everything
  ...normalizedLines, // walkable yellow + underground
  ...arrowPolylines, // arrows on top
];

// 2) Style lookup based on flags:
const styleFor = (seg) => {
  if (seg.isRoad) {
    return {
      strokeColor: "rgba(0,100,0,0.5)", // pale dark‑green
      strokeWidth: 6,
      zIndex: 0,
    };
  }
  if (seg.isArrow) {
    return {
      strokeColor: "red",
      strokeWidth: 4,
      zIndex: 2,
    };
  }
  if (seg.isUnderground) {
    return {
      strokeColor: "#5b5be8",
      strokeWidth: 4,
      lineDashPattern: [4, 8],
      zIndex: 1,
    };
  }
  // default: walkable path (yellow)
  return {
    strokeColor: "#ffef77",
    strokeWidth: 5,
    zIndex: 1,
  };
};

///////////// TEMPTS BEFORE DB MOVE //////////////////////////////////////////////////////////////////////////////////////////

const buildingsAndInfoForDb = [
  {
    buildingId: "00000000-0000-0000-0000-0000000000B1",
    name: "",
    info: "",
    entrances: [16],
    coordinates: [
      "32.310543, 34.895481",
      "32.310543, 34.895657",
      "32.310344, 34.895797",
      "32.310124, 34.895682",
      "32.309928, 34.895806",
      "32.309712, 34.895866",
      "32.309710, 34.895684",
      "32.309873, 34.895602",
      "32.309932, 34.895456",
      "32.310543, 34.895481",
    ],
    apartments: [],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B2",
    name: "",
    info: "",
    entrances: [19, 20],
    coordinates: [
      "32.310595, 34.895469",
      "32.310961, 34.895468",
      "32.310965, 34.895849",
      "32.310897, 34.895849",
      "32.310897, 34.895612",
      "32.310605, 34.895605",
      "32.310595, 34.895469",
    ],
    apartments: [],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B3",
    name: "",
    info: "",
    entrances: [70],
    coordinates: [
      "32.310055, 34.895334",
      "32.309983, 34.895381",
      "32.309937, 34.895274",
      "32.310002, 34.895204",
      "32.310055, 34.895334",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0058",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B3",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0060",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B3",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B4",
    name: "",
    info: "",
    entrances: [72],
    coordinates: [
      "32.309911, 34.895095",
      "32.309877, 34.895207",
      "32.309769, 34.895174",
      "32.309795, 34.895064",
      "32.309911, 34.895095",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0064",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B4",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0062",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B4",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B5",
    name: "",
    info: "",
    entrances: [72],
    coordinates: [
      "32.309902, 34.894901",
      "32.309881, 34.895010",
      "32.309769, 34.894983",
      "32.309776, 34.894870",
      "32.309902, 34.894901",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0061",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B5",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0063",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B5",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B6",
    name: "",
    info: "",
    entrances: [71],
    coordinates: [
      "32.310063, 34.894985",
      "32.310007, 34.895074",
      "32.309916, 34.895032",
      "32.309956, 34.894911",
      "32.310063, 34.894985",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0057",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B6",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0059",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B6",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B7",
    name: "",
    info: "",
    entrances: [70],
    coordinates: [
      "32.310213, 34.895169",
      "32.310142, 34.895224",
      "32.310082, 34.895132",
      "32.310141, 34.895057",
      "32.310213, 34.895169",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0055",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B7",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0053",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B7",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B8",
    name: "",
    info: "",
    entrances: [69],
    coordinates: [
      "32.310230, 34.895231",
      "32.310238, 34.895375",
      "32.310156, 34.895386",
      "32.310141, 34.895251",
      "32.310230, 34.895231",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0049",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B8",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0051",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B8",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-0000000000B9",
    name: "",
    info: "",
    entrances: [55],
    coordinates: [
      "32.309898, 34.894699",
      "32.309875, 34.894798",
      "32.309779, 34.894783",
      "32.309789, 34.894666",
      "32.309898, 34.894699",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0017",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B9",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0019",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-0000000000B3",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B10",
    name: "",
    info: "",
    entrances: [54],
    coordinates: [
      "32.310059, 34.894756",
      "32.310024, 34.894855",
      "32.309919, 34.894823",
      "32.309943, 34.894709",
      "32.310059, 34.894756",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0013",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B10",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0015",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B10",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B11",
    name: "",
    info: "",
    entrances: [53],
    coordinates: [
      "32.310207, 34.894868",
      "32.310149, 34.894938",
      "32.310059, 34.894890",
      "32.310106, 34.894776",
      "32.310207, 34.894868",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0009",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B11",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0011",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B11",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B12",
    name: "",
    info: "",
    entrances: [52],
    coordinates: [
      "32.310359, 34.895099",
      "32.310279, 34.895141",
      "32.310205, 34.895013",
      "32.310274, 34.894933",
      "32.310359, 34.895099",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0005",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B12",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0007",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B12",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B13",
    name: "",
    info: "",
    entrances: [50],
    coordinates: [
      "32.310397, 34.895343",
      "32.310315, 34.895361",
      "32.310291, 34.895171",
      "32.310373, 34.895149",
      "32.310397, 34.895343",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0001",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B13",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0003",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B13",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B14",
    name: "",
    info: "",
    entrances: [55],
    coordinates: [
      "32.309937, 34.894517",
      "32.309925, 34.894612",
      "32.309786, 34.894612",
      "32.309790, 34.894498",
      "32.309937, 34.894517",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0022",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B14",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0024",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B14",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B15",
    name: "",
    info: "",
    entrances: [54],
    coordinates: [
      "32.310139, 34.894590",
      "32.310104, 34.894702",
      "32.309959, 34.894646",
      "32.309988, 34.894525",
      "32.310139, 34.894590",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0018",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B15",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0020",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B15",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B16",
    name: "",
    info: "",
    entrances: [53],
    coordinates: [
      "32.310316, 34.894738",
      "32.310257, 34.894823",
      "32.310147, 34.894738",
      "32.310190, 34.894632",
      "32.310316, 34.894738",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0014",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B16",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0016",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B16",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B17",
    name: "",
    info: "",
    entrances: [52],
    coordinates: [
      "32.310479, 34.894971",
      "32.310417, 34.895011",
      "32.310342, 34.894890",
      "32.310422, 34.894825",
      "32.310479, 34.894971",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0010",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B17",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0012",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B17",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B18",
    name: "",
    info: "",
    entrances: [51],
    coordinates: [
      "32.310548, 34.895153",
      "32.310479, 34.895175",
      "32.310436, 34.895038",
      "32.310525, 34.895004",
      "32.310548, 34.895153",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0006",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B18",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0008",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B18",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B19",
    name: "",
    info: "",
    entrances: [50],
    coordinates: [
      "32.310555, 34.895203",
      "32.310562, 34.895389",
      "32.310477, 34.895390",
      "32.310463, 34.895210",
      "32.310555, 34.895203",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0002",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B19",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0004",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B19",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B20",
    name: "",
    info: "",
    entrances: [9],
    coordinates: [
      "32.310432, 34.894523",
      "32.310419, 34.894616",
      "32.310277, 34.894603",
      "32.310282, 34.894496",
      "32.310432, 34.894523",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0074",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B20",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0076",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B20",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B21",
    name: "",
    info: "",
    entrances: [8],
    coordinates: [
      "32.310612, 34.894661",
      "32.310551, 34.894722",
      "32.310475, 34.894595",
      "32.310531, 34.894521",
      "32.310612, 34.894661",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0070",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B21",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0072",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B21",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B22",
    name: "",
    info: "",
    entrances: [10],
    coordinates: [
      "32.310629, 34.894763",
      "32.310616, 34.894942",
      "32.310535, 34.894932",
      "32.310542, 34.894748",
      "32.310629, 34.894763",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0066",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B22",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0068",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B22",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B23",
    name: "",
    info: "",
    entrances: [73],
    coordinates: [
      "32.309699, 34.894865",
      "32.309702, 34.894974",
      "32.309587, 34.895002",
      "32.309563, 34.894887",
      "32.309699, 34.894865",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0065",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B23",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0067",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B23",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B24",
    name: "",
    info: "",
    entrances: [74],
    coordinates: [
      "32.309531, 34.894897",
      "32.309550, 34.895013",
      "32.309446, 34.895078",
      "32.309399, 34.894954",
      "32.309531, 34.894897",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0069",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B24",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0071",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B24",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B25",
    name: "",
    info: "",
    entrances: [76],
    coordinates: [
      "32.309399, 34.895108",
      "32.309333, 34.895210",
      "32.309244, 34.895143",
      "32.309314, 34.895026",
      "32.309399, 34.895108",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0073",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B25",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0075",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B25",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B26",
    name: "",
    info: "",
    entrances: [77],
    coordinates: [
      "32.309312, 34.895231",
      "32.309304, 34.895348",
      "32.309221, 34.895346",
      "32.309225, 34.895211",
      "32.309312, 34.895231",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0077",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B26",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0079",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B26",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B27",
    name: "",
    info: "",
    entrances: [56],
    coordinates: [
      "32.309701, 34.894673",
      "32.309696, 34.894780",
      "32.309588, 34.894800",
      "32.309571, 34.894669",
      "32.309701, 34.894673",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0021",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B27",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0023",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B27",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B28",
    name: "",
    info: "",
    entrances: [57],
    coordinates: [
      "32.309526, 34.894685",
      "32.309542, 34.894796",
      "32.309441, 34.894846",
      "32.309404, 34.894729",
      "32.309526, 34.894685",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0025",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B28",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0027",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B28",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B29",
    name: "",
    info: "",
    entrances: [58],
    coordinates: [
      "32.309409, 34.894854",
      "32.309330, 34.894914",
      "32.309263, 34.894833",
      "32.309367, 34.894737",
      "32.309409, 34.894854",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0029",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B29",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0031",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B29",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B30",
    name: "",
    info: "",
    entrances: [63],
    coordinates: [
      "32.309259, 34.894982",
      "32.309185, 34.895123",
      "32.309100, 34.895076",
      "32.309185, 34.894911",
      "32.309259, 34.894982",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0033",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B30",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0035",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B30",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B31",
    name: "",
    info: "",
    entrances: [65],
    coordinates: [
      "32.309156, 34.895163",
      "32.309136, 34.895338",
      "32.309048, 34.895337",
      "32.309068, 34.895150",
      "32.309156, 34.895163",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0037",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B31",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0039",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B31",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B32",
    name: "",
    info: "",
    entrances: [56],
    coordinates: [
      "32.309709, 34.894494",
      "32.309697, 34.894601",
      "32.309566, 34.894611",
      "32.309553, 34.894491",
      "32.309709, 34.894494",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0026",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B32",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0028",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B32",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B33",
    name: "",
    info: "",
    entrances: [57],
    coordinates: [
      "32.309482, 34.894485",
      "32.309500, 34.894593",
      "32.309385, 34.894650",
      "32.309338, 34.894543",
      "32.309482, 34.894485",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0030",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B33",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0032",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B33",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B34",
    name: "",
    info: "",
    entrances: [58],
    coordinates: [
      "32.309323, 34.894674",
      "32.309230, 34.894789",
      "32.309159, 34.894710",
      "32.309277, 34.894588",
      "32.309323, 34.894674",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0034",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B34",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0036",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B34",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B35",
    name: "",
    info: "",
    entrances: [63],
    coordinates: [
      "32.309160, 34.894833",
      "32.309070, 34.894967",
      "32.308989, 34.894920",
      "32.309097, 34.894768",
      "32.309160, 34.894833",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0038",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B35",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0040",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B35",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B36",
    name: "",
    info: "",
    entrances: [64],
    coordinates: [
      "32.309029, 34.895000",
      "32.308988, 34.895134",
      "32.308901, 34.895102",
      "32.308938, 34.894946",
      "32.309029, 34.895000",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0042",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B36",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0044",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B36",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B37",
    name: "",
    info: "",
    entrances: [65],
    coordinates: [
      "32.308981, 34.895180",
      "32.308956, 34.895338",
      "32.308877, 34.895329",
      "32.308901, 34.895157",
      "32.308981, 34.895180",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0046",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B37",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0048",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B37",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B38",
    name: "",
    info: "",
    entrances: [61],
    coordinates: [
      "32.309227, 34.894476",
      "32.309222, 34.894596",
      "32.309085, 34.894582",
      "32.309092, 34.894463",
      "32.309227, 34.894476",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0078",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B38",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0080",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B38",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B39",
    name: "",
    info: "",
    entrances: [60],
    coordinates: [
      "32.309071, 34.894582",
      "32.309001, 34.894705",
      "32.308918, 34.894655",
      "32.308971, 34.894494",
      "32.309071, 34.894582",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0082",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B39",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0084",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B39",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B40",
    name: "",
    info: "",
    entrances: [62],
    coordinates: [
      "32.308986, 34.894724",
      "32.308962, 34.894873",
      "32.308879, 34.894872",
      "32.308895, 34.894705",
      "32.308986, 34.894724",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0086",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B40",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0088",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B40",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B41",
    name: "",
    info: "",
    entrances: [78],
    coordinates: [
      "32.309307, 34.895429",
      "32.309300, 34.895606",
      "32.309227, 34.895609",
      "32.309225, 34.895424",
      "32.309307, 34.895429",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0081",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B41",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0083",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B41",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B42",
    name: "",
    info: "",
    entrances: [79],
    coordinates: [
      "32.309296, 34.895640",
      "32.309290, 34.895811",
      "32.309215, 34.895815",
      "32.309216, 34.895643",
      "32.309296, 34.895640",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0085",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B42",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0087",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B42",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B43",
    name: "",
    info: "",
    entrances: [66],
    coordinates: [
      "32.309148, 34.895432",
      "32.309144, 34.895607",
      "32.309042, 34.895607",
      "32.309041, 34.895434",
      "32.309148, 34.895432",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0041",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B43",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0043",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B43",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B44",
    name: "",
    info: "",
    entrances: [67],
    coordinates: [
      "32.309144, 34.895649",
      "32.309136, 34.895821",
      "32.309033, 34.895820",
      "32.309031, 34.895648",
      "32.309144, 34.895649",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0045",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B44",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0047",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B44",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B45",
    name: "",
    info: "",
    entrances: [83],
    coordinates: [
      "32.308958, 34.895431",
      "32.308959, 34.895611",
      "32.308843, 34.895615",
      "32.308841, 34.895429",
      "32.308958, 34.895431",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0050",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B45",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0052",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B45",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B46",
    name: "",
    info: "",
    entrances: [82],
    coordinates: [
      "32.308941, 34.895659",
      "32.308940, 34.895815",
      "32.308833, 34.895805",
      "32.308836, 34.895643",
      "32.308941, 34.895659",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0054",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B46",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0056",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B46",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B47",
    name: "",
    info: "",
    entrances: [41],
    coordinates: [
      "32.310830, 34.895193",
      "32.310814, 34.895376",
      "32.310729, 34.895383",
      "32.310734, 34.895192",
      "32.310830, 34.895193",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0501",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B47",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0503",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B47",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B48",
    name: "",
    info: "",
    entrances: [42],
    coordinates: [
      "32.310882, 34.895007",
      "32.310837, 34.895158",
      "32.310760, 34.895143",
      "32.310788, 34.894970",
      "32.310882, 34.895007",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0505",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B48",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0507",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B48",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B49",
    name: "",
    info: "",
    entrances: [43],
    coordinates: [
      "32.310977, 34.894827",
      "32.310902, 34.894986",
      "32.310819, 34.894956",
      "32.310885, 34.894787",
      "32.310977, 34.894827",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0509",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B49",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0511",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B49",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B50",
    name: "",
    info: "",
    entrances: [41],
    coordinates: [
      "32.311004, 34.895228",
      "32.310986, 34.895381",
      "32.310875, 34.895387",
      "32.310888, 34.895189",
      "32.311004, 34.895228",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0504",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B50",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0502",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B50",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B51",
    name: "",
    info: "",
    entrances: [42],
    coordinates: [
      "32.311070, 34.895027",
      "32.311018, 34.895187",
      "32.310923, 34.895161",
      "32.310982, 34.894988",
      "32.311070, 34.895027",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0506",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B51",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0508",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B51",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B52",
    name: "",
    info: "",
    entrances: [43],
    coordinates: [
      "32.311177, 34.894861",
      "32.311098, 34.894999",
      "32.311012, 34.894952",
      "32.311085, 34.894794",
      "32.311177, 34.894861",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0510",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B52",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0512",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B52",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B53",
    name: "",
    info: "",
    entrances: [44],
    coordinates: [
      "32.311203, 34.895237",
      "32.311161, 34.895398",
      "32.311059, 34.895383",
      "32.311108, 34.895181",
      "32.311203, 34.895237",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0609",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B53",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0611",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B53",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B54",
    name: "",
    info: "",
    entrances: [45],
    coordinates: [
      "32.311295, 34.895025",
      "32.311222, 34.895197",
      "32.311130, 34.895155",
      "32.311192, 34.894976",
      "32.311295, 34.895025",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0613",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B54",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0615",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B54",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B55",
    name: "",
    info: "",
    entrances: [46],
    coordinates: [
      "32.311410, 34.894879",
      "32.311297, 34.895010",
      "32.311230, 34.894943",
      "32.311333, 34.894799",
      "32.311410, 34.894879",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0617",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B55",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0619",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B55",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B56",
    name: "",
    info: "",
    entrances: [44],
    coordinates: [
      "32.311382, 34.895250",
      "32.311338, 34.895403",
      "32.311244, 34.895382",
      "32.311297, 34.895203",
      "32.311382, 34.895250",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0610",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B56",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0612",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B56",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B57",
    name: "",
    info: "",
    entrances: [46],
    coordinates: [
      "32.311499, 34.895058",
      "32.311414, 34.895210",
      "32.311337, 34.895157",
      "32.311420, 34.894985",
      "32.311499, 34.895058",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0614",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B57",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0616",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B57",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B58",
    name: "",
    info: "",
    entrances: [47],
    coordinates: [
      "32.311654, 34.894916",
      "32.311540, 34.895027",
      "32.311482, 34.894940",
      "32.311595, 34.894825",
      "32.311654, 34.894916",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0618",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B58",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0620",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B58",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B59",
    name: "",
    info: "",
    entrances: [23],
    coordinates: [
      "32.311583, 34.895270",
      "32.311505, 34.895398",
      "32.311431, 34.895353",
      "32.311510, 34.895198",
      "32.311583, 34.895270",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0709",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B59",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0711",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B59",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B60",
    name: "",
    info: "",
    entrances: [24],
    coordinates: [
      "32.311718, 34.895124",
      "32.311608, 34.895236",
      "32.311539, 34.895150",
      "32.311671, 34.895015",
      "32.311718, 34.895124",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0713",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B60",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0715",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B60",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B61",
    name: "",
    info: "",
    entrances: [48],
    coordinates: [
      "32.311139, 34.895493",
      "32.311131, 34.895683",
      "32.311030, 34.895685",
      "32.311029, 34.895485",
      "32.311139, 34.895493",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0605",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B61",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0607",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B61",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B62",
    name: "",
    info: "",
    entrances: [49],
    coordinates: [
      "32.311107, 34.895737",
      "32.311106, 34.895915",
      "32.311012, 34.895920",
      "32.311028, 34.895726",
      "32.311107, 34.895737",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0601",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B62",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0603",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B62",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B63",
    name: "",
    info: "",
    entrances: [48],
    coordinates: [
      "32.311330, 34.895480",
      "32.311324, 34.895687",
      "32.311215, 34.895694",
      "32.311212, 34.895481",
      "32.311330, 34.895480",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0606",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B63",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0608",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B63",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B64",
    name: "",
    info: "",
    entrances: [49],
    coordinates: [
      "32.311316, 34.895737",
      "32.311313, 34.895903",
      "32.311216, 34.895903",
      "32.311208, 34.895729",
      "32.311316, 34.895737",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0602",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B64",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0604",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B64",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B65",
    name: "",
    info: "",
    entrances: [32],
    coordinates: [
      "32.311501, 34.895508",
      "32.311509, 34.895671",
      "32.311384, 34.895676",
      "32.311384, 34.895491",
      "32.311501, 34.895508",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0705",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B65",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0707",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B65",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B66",
    name: "",
    info: "",
    entrances: [33],
    coordinates: [
      "32.311500, 34.895741",
      "32.311499, 34.895898",
      "32.311399, 34.895898",
      "32.311400, 34.895738",
      "32.311500, 34.895741",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0701",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B66",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A0703",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B66",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B67",
    name: "",
    info: "",
    entrances: [31],
    coordinates: [
      "32.311123, 34.894506",
      "32.311120, 34.894709",
      "32.310742, 34.894691",
      "32.310741, 34.894492",
      "32.311123, 34.894506",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1151",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1152",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1153",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1154",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1155",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1156",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1158",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1251",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1252",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1254",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1255",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1256",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1257",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1258",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1351",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1352",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1353",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A1354",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B67",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B68",
    name: "",
    info: "",
    entrances: [29],
    coordinates: [
      "32.311407, 34.894518",
      "32.311404, 34.894686",
      "32.311135, 34.894691",
      "32.311137, 34.894517",
      "32.311407, 34.894518",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2151",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2152",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2154",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2155",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2156",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2251",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2253",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2254",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2255",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2256",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2257",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2351",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2352",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2353",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A2354",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B68",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B69",
    name: "",
    info: "",
    entrances: [28],
    coordinates: [
      "32.311741, 34.894537",
      "32.311741, 34.894686",
      "32.311421, 34.894693",
      "32.311422, 34.894522",
      "32.311741, 34.894537",
    ],
    apartments: [
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3151",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3152",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3153",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3155",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3157",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3158",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3252",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3253",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3255",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3258",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3351",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3352",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3353",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
      {
        apartmentNumber: "00000000-0000-0000-0000-0000000A3354",
        apartmentName: "MapScreen_Apartment",
        floorNumber: null,
        accessBuildingId: "00000000-0000-0000-0000-000000000B69",
      },
    ],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B70",
    name: "Map_pool",
    info: "",
    entrances: [12],
    coordinates: [
      "32.309632, 34.895604",
      "32.309624, 34.895811",
      "32.309382, 34.895799",
      "32.309380, 34.895602",
      "32.309632, 34.895604",
    ],
    apartments: [],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B71",
    name: "Map_GrasslandsAndFountain",
    info: "",
    entrances: [1, 11],
    coordinates: [
      "32.309709, 34.895092",
      "32.309700, 34.895212",
      "32.309563, 34.895364",
      "32.309384, 34.895350",
      "32.309422, 34.895219",
      "32.309502, 34.895190",
      "32.309534, 34.895111",
      "32.309709, 34.895092",
    ],
    apartments: [],
  },
  {
    buildingId: "00000000-0000-0000-0000-000000000B72",
    name: "Map_OakComplexAndPetanque",
    info: "",
    entrances: [22, 23, 24, 32, 33],
    coordinates: [
      "32.311849, 34.895444",
      "32.311668, 34.895842",
      "32.311592, 34.895868",
      "32.311557, 34.895477",
      "32.311727, 34.895196",
      "32.311794, 34.895214",
      "32.311849, 34.895444",
    ],
    apartments: [],
  },
];
const buildingsToRender = buildingsAndInfoForDb
  .map((building) => {
    // The coordinates are strings, so we need to parse them into objects
    const parsedCoords = building.coordinates
      .map((coordString) => {
        const [lat, lon] = coordString.split(", ").map(Number);
        return { latitude: lat, longitude: lon };
      })
      .filter((coord) => !isNaN(coord.latitude) && !isNaN(coord.longitude)); // Filter out any invalid coordinates

    return {
      id: building.buildingId,
      // Use the name from the data or provide a fallback
      name: building.name || `Building ID: ${building.buildingId}`,
      // Use the info from the data or provide a fallback
      info: building.info || "No additional information available.",
      coordinates: parsedCoords,
    };
  })
  .filter((building) => building.coordinates.length > 0); // Ensure building has coordinates to render

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const MapBoundsCoordinations = [
  {
    latitude: 32.312541,
    longitude: 34.894063,
  },
  {
    latitude: 32.31192,
    longitude: 34.896611,
  },
  {
    latitude: 32.308411,
    longitude: 34.896262,
  },
  {
    latitude: 32.308432,
    longitude: 34.894108,
  },

  { latitude: 32.312541, longitude: 34.894063 },
];

const boundaryPolygonForCheck = MapBoundsCoordinations.map((p) => [
  p.longitude,
  p.latitude,
]);

const nodesById = mapNodes.reduce((acc, node) => {
  const [lat, lon] = node.coords.split(", ").map(Number);
  acc[node.id] = { latitude: lat, longitude: lon };
  return acc;
}, {});

const Map = () => {
  const { t } = useTranslation();

  const buildingsCoordinations = [
    {
      id: "B1",
      name: t("MapScreen_building1Name"),
      info: t("MapScreen_building1Info"),
      coordinates: [
        { latitude: 32.310919, longitude: 34.895532 },
        { latitude: 32.310909, longitude: 34.895903 },
        { latitude: 32.310824, longitude: 34.895906 },
        { latitude: 32.310824, longitude: 34.895655 },
        { latitude: 32.310532, longitude: 34.895652 },
        { latitude: 32.310533, longitude: 34.895527 },
        { latitude: 32.310919, longitude: 34.895532 },
      ],
    },
  ];

  const [mapRegion, setMapRegion] = useState({
    latitude: MAP_CENTER_LATITUDE,
    longitude: MAP_CENTER_LONGITUDE,
    latitudeDelta: INITIAL_LATITUDE_DELTA,
    longitudeDelta: INITIAL_LONGITUDE_DELTA,
  });
  const [currentUserLocation, setCurrentUserLocation] = useState(null);
  const [isInsideBoundary, setIsInsideBoundary] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const mapRef = useRef(null);

  const watchId = useRef(null);

  const requestLocationPermission = async () => {
    console.log(
      "[Permissions] Requesting location permission (expo-location)..."
    );
    let { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();
    console.log("[Permissions] Expo Location Status:", status);
    if (status !== "granted") {
      console.log("[Permissions] Expo Location permission denied");
      setLocationPermissionGranted(false);

      const alertMessage = t("Permissions_locationPermissionMessage");
      const alertButtons = [{ text: t("Permissions_okButton") }];
      if (!canAskAgain) {
        alertButtons.push({
          text: t("Permissions_openSettingsButton"),
          onPress: () => Linking.openSettings(),
        });
      }
      Alert.alert(
        t("Permissions_permissionDeniedTitle"),
        alertMessage,
        alertButtons
      );
      return false;
    }
    console.log("[Permissions] Expo Location permission granted");
    setLocationPermissionGranted(true);
    return true;
  };

  useEffect(() => {
    console.log("[Effect] Map component mounted. Requesting permission...");

    let locationSubscription = null;

    const activateLocation = async () => {
      const granted = await requestLocationPermission();
      console.log("[Effect] Permission request finished. Granted:", granted);

      if (granted) {
        console.log(
          "[Effect] Permission granted. Getting initial position (expo-location)..."
        );
        try {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          console.log(
            "[Effect] getCurrentPositionAsync SUCCESS:",
            JSON.stringify(location.coords, null, 2)
          );
          setCurrentUserLocation(location.coords);

          const userCoordsForCheck = [
            location.coords.longitude,
            location.coords.latitude,
          ];
          const isInside = pointInPolygon(
            userCoordsForCheck,
            boundaryPolygonForCheck
          );
          setIsInsideBoundary(isInside);
        } catch (error) {
          console.error("[Effect] getCurrentPositionAsync ERROR:", error);
          Alert.alert(
            "Error Getting Location",
            `Could not fetch initial location: ${error.message}`
          );
        }

        console.log("[Effect] Starting location watcher (expo-location)...");
        try {
          if (watchId.current) {
            console.log("[Effect] Removing previous location subscription.");
            watchId.current.remove();
            watchId.current = null;
          }

          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (location) => {
              setCurrentUserLocation(location.coords);

              const userCoordsForCheck = [
                location.coords.longitude,
                location.coords.latitude,
              ];
              const isInside = pointInPolygon(
                userCoordsForCheck,
                boundaryPolygonForCheck
              );
              setIsInsideBoundary(isInside);
            }
          );
          watchId.current = locationSubscription;
          console.log("[Effect] watchPositionAsync started.");
        } catch (error) {
          console.error("[Effect] watchPositionAsync ERROR:", error);
          Alert.alert(
            "Error Watching Location",
            `Could not start location updates: ${error.message}`
          );
        }
      } else {
        console.log(
          "[Effect] Permission denied by user. Location tracking not started."
        );
      }
    };

    activateLocation();

    return () => {
      if (watchId.current) {
        console.log(
          "[Effect] Map component unmounting. Removing location subscription."
        );
        watchId.current.remove();
        watchId.current = null;
      }
    };
  }, []);

  const handleBuildingPress = (building) => {
    setSelectedBuilding(building);
    setIsModalVisible(true);
  };

  const onRegionChangeComplete = (newRegion) => {
    setMapRegion(newRegion);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType="standard"
        region={mapRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        onMapReady={() => console.log("Map is ready!")}
        showsUserLocation={locationPermissionGranted}
        showsMyLocationButton={locationPermissionGranted}
        followsUserLocation={false}
        onError={(error) => console.error("MapView Error:", error)}
      >
        {/* Polygons */}
        <Polygon
          coordinates={MapBoundsCoordinations}
          strokeColor="rgba(255, 0, 0, 0.4)"
          strokeWidth={2}
          fillColor={"rgba(55, 180, 0, 0.15)"}
        />
        {/* {buildingsCoordinations.map((building) => (
          <Polygon
            key={building.id}
            coordinates={building.coordinates}
            fillColor="rgba(0, 0, 255, 0.1)"
            strokeColor="rgba(0, 0, 255, 1)"
            strokeWidth={1.5}
            tappable={true}
            onPress={() => handleBuildingPress(building)}
          />
        ))} */}

        {/*   TEST BEFORE DB MOVE      */}
        {buildingsToRender.map((building) => (
          <Polygon
            key={building.id}
            coordinates={building.coordinates}
            fillColor="rgba(0, 0, 255, 0.1)"
            strokeColor="rgba(0, 0, 255, 1)"
            strokeWidth={1.5}
            tappable={true}
            onPress={() => handleBuildingPress(building)}
          />
        ))}

        {allSegments.map((seg, i) => {
          const { strokeColor, strokeWidth, lineDashPattern, zIndex } =
            styleFor(seg);
          return (
            <Polyline
              key={`seg-${i}`}
              coordinates={seg.coordinates}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              lineDashPattern={lineDashPattern}
              zIndex={zIndex}
            />
          );
        })}

        {/* {mapNodes.map((node) => {
          const [lat, lon] = node.coords.split(", ").map(Number);
          return (
            <Marker
              key={`node-${node.id}`}
              coordinate={{ latitude: lat, longitude: lon }}
              title={`Node ${node.id}`}
              pinColor="blue"
            />
          );
        })} */}
      </MapView>

      {/*/ For dev purposes mainly/*/}
      <View style={styles.statusOverlay}>
        <Text style={styles.statusText}>
          {t("LocationScreen_locationPermissionLabel")}
          {locationPermissionGranted ? "Granted" : "Not Granted"}
        </Text>
        {locationPermissionGranted && (
          <Text style={styles.statusText}>
            {t("LocationScreen_userLocationLabel")}
            {currentUserLocation
              ? `${currentUserLocation.latitude.toFixed(
                  4
                )}, ${currentUserLocation.longitude.toFixed(4)}`
              : "Tracking..."}
          </Text>
        )}
        {locationPermissionGranted && currentUserLocation && (
          <Text
            style={[
              styles.statusText,
              { color: isInsideBoundary ? "lime" : "red", fontWeight: "bold" },
            ]}
          >
            {t("LocationScreen_insideBoundaryLabel")}
            {isInsideBoundary ? "Yes" : "No"}
          </Text>
        )}
      </View>

      {/* Building Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
          setSelectedBuilding(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBackground} />
          <View style={styles.modalView}>
            {selectedBuilding && (
              <>
                <Text style={styles.modalTitle}>{selectedBuilding.name}</Text>
                <Text style={styles.modalText}>{selectedBuilding.info}</Text>
              </>
            )}
            <FlipButton
              style={styles.modalButton}
              onPress={() => {
                setIsModalVisible(false);
                setSelectedBuilding(null);
              }}
            >
              <Text>{t("MapScreen_backToMapButton")}</Text>
            </FlipButton>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  statusOverlay: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 5,
    zIndex: 1,
  },
  statusText: {
    color: "white",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: "70%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Map;
