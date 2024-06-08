export interface Location {
    lat: number;
    lng: number;
    zoom: number;
    address_level_1?:string;
    address_level_2?: string;
    address_country?: string;
    address_zip?: string;
    address_state?: string;
    label: string;
  }