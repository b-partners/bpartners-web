import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { CSSProperties, Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { errorStyle, INVOICE_EDITION } from '../style';

export type InvoiceAccordionProps = {
  label: string;
  children: ReactNode;
  index: number;
  isExpanded: number;
  onExpand: Dispatch<SetStateAction<number>>;
  error?: boolean;
} & Pick<CSSProperties, 'width'>;

const InvoiceAccordion: FC<InvoiceAccordionProps> = props => {
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
