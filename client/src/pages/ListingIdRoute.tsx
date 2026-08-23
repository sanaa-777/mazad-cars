import { useRoute } from "wouter";
import ListingDetail from "./ListingDetail";
export default function ListingIdRoute() { const [, params] = useRoute("/listings/:id"); return <ListingDetail key={params?.id} />; }
