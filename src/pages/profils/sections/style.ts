import { PALETTE_COLORS } from "@/common/config/theme";
import { SxProps } from "@mui/material";




export const AccountStyle: SxProps = {
    width: '100%',
    py: 4,
    bgcolor: '#ffffffff',
'& #container': {
    maxWidth: '1400px',
    mx: 'auto',
    px: 2,
},
'& .card': {
    borderRadius: 3,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    bgcolor: '#fff',
    p: 2,
    minHeight: '250px',
},
'& .card-user': {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
},
'& .user-header': {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mb: 1,
},
'& .avatar': {
    width: 170,
    height: 170,
},
'& .card-trial': {
    textAlign: 'center',
    bgcolor: '#ffffffff',
},
'& .company-card': {
    border: `2px solid ${PALETTE_COLORS.pine || '#3e7e60'}`,
    mt: 3,
},
'& .section-title': {
    backgroundColor: PALETTE_COLORS.pine || '#3e7e60',
    color: 'white',
    textAlign: 'center',
    fontWeight: 600,
    borderRadius: 25,
    py: 1,
    mb: 3,
    mx: 'auto',
    fontSize: '1.1rem',
    width: '300px',
},
'& .MuiTextField-root': {
    bgcolor: '#fafafa',
},
'& .container-typo-user':{
    ml: 7,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
},
'& .typo-user':{
    my: 1.2,
    fontWeight: 'bold',
},

};