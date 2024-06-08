// Interface Station
export interface Station {
    id: string;
    stationName: string;
    availableBikes: number;
    availableDocks: number;
    is_renting: String;
    lastCommunicationTime: String;
    latitude: number;
    longitude: number;
    status: String;
    totalDocks: Number;

}
