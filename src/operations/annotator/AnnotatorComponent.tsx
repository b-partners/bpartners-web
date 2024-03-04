// import annotatorLib from '@bpartners/annotator-component';
import{AnnotatorCanvas} from '@bpartners/annotator-component';
import { useEffect, useState } from 'react';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams } from 'src/common/utils';
import { annotatorProvider } from 'src/providers/annotator-provider';


const AnnotatorComponent = () => {

    const {polygons, setPolygons, updatePolygonList} = useCanvasAnnotationContext();
    const [imgUrl, setImgUrl] = useState('');
    
    useEffect(()=>{
      const fetch = async ()=>{
        const data = await annotatorProvider();
        setPolygons(data);
      };
      fetch();
    },[setPolygons])

    useEffect(()=>{
       setImgUrl(getUrlParams(window.location.search, 'imgUrl'))
    },[])
          
    return (
            <AnnotatorCanvas
            allowAnnotation
            width='100%'
            height='100%'
            image={imgUrl}
            setPolygons= {updatePolygonList}
            polygonList= {polygons}
            />
    );
};

export default AnnotatorComponent;