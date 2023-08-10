export type AllDirectionType={
    [key: string]: OneDirectionType[];}

export type OneDirectionType = {
    directions: google.maps.DirectionsResult | null;
    show: boolean;
    pathOptions: PathOptionsType;
}

export type PathOptionsType = {
    zIndex: number,
    strokeColor: string,
    strokeWeight: number,
}
    