export interface OurAirportsCsv {
    id: string;
    ident: string;
    type: string;
    name: string;
    latitude_deg: string;
    longitude_deg: string;
    elevation_ft: string;
    continent: string;
    iso_country: string;
    iso_region: string;
    municipality: string;
    scheduled_service: string;
    icao_code: string;
    iata_code: string;
    gps_code: string;
    local_code: string;
    home_link: string;
    wikipedia_link: string;
    keywords: string;
}

export interface StaticAirport {
    id: number;
    size: string;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number | null;
    continent: string;
    iso_country: string;
    iso_region: string;
    municipality: string;
    scheduled_service: boolean;
    icao: string;
    iata: string;
    home_link: string;
    wikipedia_link: string;
}