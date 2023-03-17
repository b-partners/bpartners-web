import { Typography } from '@mui/material';

const BpTextAdornment = ({ label, sx }) => <Typography sx={{ position: 'relative', top: 10, ...sx }}>{label}</Typography>;

export default BpTextAdornment;
