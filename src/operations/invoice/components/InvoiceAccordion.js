import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { INVOICE_EDITION } from '../style';

const InvoiceAccordion = props => {
  const { label, children, index, isExpanded, onExpand, sx, ...others } = props;

  const handleClick = () => onExpand(lastIndex => (lastIndex === index ? 0 : index));

  return (
    <Accordion expanded={isExpanded === index}>
      <AccordionSummary onClick={handleClick} expandIcon={<ExpandMoreIcon />}>
        {label}
      </AccordionSummary>
      <AccordionDetails sx={{ ...INVOICE_EDITION.ACCORDION_DETAILS, ...sx }}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default InvoiceAccordion;
