import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, FormHelperText } from '@mui/material';
import { errorStyle, INVOICE_EDITION } from '../style';

const InvoiceAccordion = props => {
  const { label, children, index, isExpanded, onExpand, sx, error = false, ...others } = props;

  const handleClick = () => onExpand(lastIndex => (lastIndex === index ? 0 : index));

  return (
    <>
      <Accordion sx={error && errorStyle} expanded={isExpanded === index}>
        <AccordionSummary onClick={handleClick} expandIcon={<ExpandMoreIcon />}>
          {label}
        </AccordionSummary>
        <AccordionDetails sx={{ ...INVOICE_EDITION.ACCORDION_DETAILS, ...sx }}>{children}</AccordionDetails>
      </Accordion>
      <FormHelperText title='this' />
    </>
  );
};

export default InvoiceAccordion;
