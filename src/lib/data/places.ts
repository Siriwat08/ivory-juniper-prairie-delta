import type { Place } from "@/lib/engine/types";

export const PLACES: Place[] = [
  {
    id: "scgjwd-wangnoi",
    name: "คลังสินค้า SCG JWD วังน้อย",
    address: "อ.วังน้อย จ.พระนครศรีอยุธยา",
    lat: 14.2482,
    lng: 100.7248,
    kind: "origin",
    clientSite: true,
  },
  {
    id: "scgjwd-bangna",
    name: "คลัง SCG JWD บางนา",
    address: "บางนา กรุงเทพฯ",
    lat: 13.6048,
    lng: 100.7042,
    clientSite: true,
  },
  {
    id: "scgjwd-lcb",
    name: "SCG JWD แหลมฉบัง",
    address: "ศรีราชา ชลบุรี",
    lat: 13.0836,
    lng: 100.883,
    clientSite: true,
  },
  {
    id: "nakhonsawan",
    name: "จุดส่งสินค้านครสวรรค์",
    address: "อ.เมือง จ.นครสวรรค์",
    lat: 15.6938,
    lng: 100.1229,
    kind: "waypoint",
  },
  {
    id: "chiangmai",
    name: "จุดส่งสินค้าเชียงใหม่",
    address: "อ.เมือง จ.เชียงใหม่",
    lat: 18.7883,
    lng: 98.9853,
    kind: "destination",
  },
  {
    id: "khonkaen",
    name: "จุดส่งสินค้าขอนแก่น",
    address: "อ.เมือง จ.ขอนแก่น",
    lat: 16.4419,
    lng: 102.836,
  },
  {
    id: "hatyai",
    name: "จุดส่งสินค้าหาดใหญ่",
    address: "อ.หาดใหญ่ จ.สงขลา",
    lat: 7.0084,
    lng: 100.4747,
  },
  {
    id: "rayong",
    name: "จุดส่งสินค้าระยอง",
    address: "อ.เมือง จ.ระยอง",
    lat: 12.6814,
    lng: 101.2816,
  },
  {
    id: "tak",
    name: "ตัวเมืองตาก",
    address: "อ.เมือง จ.ตาก",
    lat: 16.884,
    lng: 99.1258,
  },
  {
    id: "lampang",
    name: "ตัวเมืองลำปาง",
    address: "อ.เมือง จ.ลำปาง",
    lat: 18.2883,
    lng: 99.4906,
  },
  {
    id: "saraburi",
    name: "สระบุรี",
    address: "อ.เมือง จ.สระบุรี",
    lat: 14.5289,
    lng: 100.9102,
  },
  {
    id: "lopburi",
    name: "ลพบุรี",
    address: "อ.เมือง จ.ลพบุรี",
    lat: 14.7995,
    lng: 100.6534,
  },
  {
    id: "bangkok",
    name: "กรุงเทพฯ (จุดอ้างอิง)",
    address: "ปทุมวัน",
    lat: 13.7563,
    lng: 100.5018,
  },
];

export function placeById(id: string) {
  return PLACES.find((p) => p.id === id);
}

export function searchPlaces(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return PLACES;
  return PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      (p.address ?? "").toLowerCase().includes(s),
  );
}
