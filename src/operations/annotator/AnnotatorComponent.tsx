// import annotatorLib from '@bpartners/annotator-component';
import{AnnotatorCanvas, Polygon} from '@bpartners/annotator-component';


const AnnotatorComponent = () => {
    let allPolygon = [
        {
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
          ]
      },
      {
        "fillColor": "#00ff0040",
        "strokeColor": "#00ff00",
        "points": [
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
        ]
    }
      ]
    const addPolygoneAnnotator = (polygon: Polygon)=>{
        console.log("polygon", polygon);
        const test = allPolygon.push(polygon);
        console.log("test", test);
      }
    
    return (
        <div>
            <AnnotatorCanvas
            allowAnnotation
            width='100%'
            height='50%'
            image={"https://capable.ctreq.qc.ca/wp-content/uploads/2017/01/exemple-image-e1486497635469.jpg"}
            addPolygone= {addPolygoneAnnotator}
            polygoneList= {allPolygon}
            />
        </div>
    );
};

export default AnnotatorComponent;