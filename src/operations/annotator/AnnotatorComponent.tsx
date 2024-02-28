// import annotatorLib from '@bpartners/annotator-component';
import{AnnotatorCanvas} from '@bpartners/annotator-component';
import { useEffect } from 'react';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { annotatorProvider } from 'src/providers/annotator-provider';


const AnnotatorComponent = () => {

    const {polygons, setPolygons, addNewPolygon} = useCanvasAnnotationContext();
    
    useEffect(()=>{
      const fetch = async ()=>{
        const data = await annotatorProvider();
        setPolygons(data);
      };
      fetch();
    },[setPolygons])

          
    return (
        <div>
            <AnnotatorCanvas
            allowAnnotation
            width='100%'
            height='100%'
            image={"https://capable.ctreq.qc.ca/wp-content/uploads/2017/01/exemple-image-e1486497635469.jpg"}
            addPolygone= {addNewPolygon}
            polygoneList= {polygons}
            />
        </div>
    );
};

export default AnnotatorComponent;