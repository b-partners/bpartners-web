// import annotatorLib from '@bpartners/annotator-component';
import{AnnotatorCanvas} from '@bpartners/annotator-component';
import { useEffect, useState } from 'react';
import { useCanvasAnnotationContext } from 'src/common/store/annotator/Canvas-annotation-store';
import { getUrlParams } from 'src/common/utils';
import { annotatorProvider } from 'src/providers/annotator-provider';
import annotator_img from '../../assets/Rennes_Solar_Panel_Batch_1_519355_363821.jpg';



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
    },[]);


    return (
            <AnnotatorCanvas
            allowAnnotation
            width='100%'
            height='100%'
            image={annotator_img}
            setPolygons= {updatePolygonList}
            polygonList= {polygons}
            polygonLineSizeProps={{imageName:"Rennes_Solar_Panel_Batch_1_519355_363821.jpg", showLineSize: true}}
            />
    );
};

export default AnnotatorComponent;