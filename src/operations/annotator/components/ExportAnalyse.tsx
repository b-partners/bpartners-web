import { Box, Typography } from "@mui/material";
import { AnnotatorComponent } from "../AnnotatorComponent";
import { BPButton, FlexBox } from "@/common/components";
import { useWindowResize } from "@/common/hooks";
import { getCached } from "@/providers";
import "./export.css"

export const ExportAnalyse = () => {
  const { width, height } = useWindowResize();
  const polygons = getCached.polygons();

  return (
    <Box sx={{ mx: "auto" }}>
      <Typography className="hide-on-print" sx={{ fontWeight: "bold", my: 1, textAlign: "center", opacity: .9, fontSize: "1.2rem" }}>
        Exporter l'analyse sous format PDF
      </Typography>
      <FlexBox className="hide-on-print" sx={{ gap: 1 }}>
        <BPButton
          onClick={() => window.print()}
          label="resources.draftsAnnotations.export"
        />
        <BPButton label="Retourner vers l'annotations" />
      </FlexBox>
      <Box sx={{ border: "1px solid #00000040", p: 2, borderRadius: "15px", mx: "auto", width: 'fit-content' }}>
        <AnnotatorComponent
          polygons={polygons}
          allowSelect={false}
          allowAnnotation={false}
          width={700}
          height={height * 0.7}
          buttonComponent={() => null}
          showFileSource={false}
        />
      </Box>
    </Box>
  )
}
