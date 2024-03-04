import { Polygon } from "@bpartners/annotator-component";

interface Label {
    id: string;
    name: string;
}
export interface VerifyAdress {
    Longitude: number;
    Latitude: number;
}

export const annotations : Polygon[] = [
   /* {
        // surface: 140,  LA SURFACE vas être ajouté normalement ici, voir avec Amour 🚨
        id: '56789',
        fillColor: "#00ff0040",
        strokeColor: "#00ff00",
          points: [
              {
                  "x": 400,
                  "y": 31.08108108108108
              },
              {
                  "x": 348.64864864864865,
                  "y": 108.10810810810811
              },
              {
                  "x": 485.13513513513516,
                  "y": 108.10810810810811
              },
              {
                  "x": 400,
                  "y": 31.08108108108108
              }
          ],
    },
    {
        // surface: 95,
        id: '01234',
        fillColor: "#00ff0040",
        strokeColor: "#00ff00",
        points: [
            {
                "x": 117.56756756756756,
                "y": 300
            },
            {
                "x": 114.86486486486487,
                "y": 278.3783783783784
            },
            {
                "x": 71.62162162162163,
                "y": 282.43243243243245
            },
            {
                "x": 71.62162162162163,
                "y": 251.35135135135135
            },
            {
                "x": 106.75675675675676,
                "y": 247.2972972972973
            },
            {
                "x": 106.75675675675676,
                "y": 232.43243243243245
            },
            {
                "x": 71.62162162162163,
                "y": 228.3783783783784
            },
            {
                "x": 71.62162162162163,
                "y": 200
            },
            {
                "x": 114.86486486486487,
                "y": 200
            },
            {
                "x": 116.21621621621622,
                "y": 181.0810810810811
            },
            {
                "x": 45.945945945945944,
                "y": 185.13513513513513
            },
            {
                "x": 47.2972972972973,
                "y": 300
            },
            {
                "x": 117.56756756756756,
                "y": 300
            }
        ],
}*/
];
export const labels: Label[] = [
    {id: 'solId', name: 'sol'},
    {id: 'veluxId', name: 'Velux'},
    {id: 'arbresId', name: 'Arbres'}
]

export const verifyAdressResponse: VerifyAdress = {
    Longitude : -73.985428,
    Latitude : 40.748817
}