import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { INVOICE_EDITION, errorStyle } from '../style';

const InvoiceAccordion = props => {
  const { label, children, index, isExpanded, onExpand, error = false, width } = props;

  const handleClick = () => onExpand(lastIndex => (lastIndex === index ? 0 : index));

  return (
    <Accordion sx={error ? errorStyle : undefined} expanded={isExpanded === index} style={{ width }}>
      <AccordionSummary data-testid={`invoice-${label}-accordion`} onClick={handleClick} expandIcon={<ExpandMoreIcon />}>
        {label}
      </AccordionSummary>
      <AccordionDetails sx={{ ...INVOICE_EDITION.ACCORDION_DETAILS }}>{children}</AccordionDetails>
    </Accordion>
  );
};

export default InvoiceAccordion;
