import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import authProvider from '../providers/authProvider';

const useStyles = makeStyles({
  textInput: {
    width: '100%',
    backgroundColor: '#E8F0FE',
    padding: '10px  0px 10px 0px',
    marginTop: '5px',
    marginBottom: '5px',
    border: '0',
    outline: '0',
    borderBottom: '1px solid #000000',
  },
  submitInput: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: '1.4em',
    fontFamily: 'Roboto,Helvetica, sans-serif',
    textTransform: 'uppercase',
    padding: '10px',
    width: '100%',
    cursor: 'pointer',
    backgroundColor: '#3f51b5',
    border: '0',
    borderRadius: '4px',
    '&:hover, &:focus': {
      backgroundColor: '#303f9f',
    },
    '&:active': {
      backgroundColor: '#e0e0e0',
      color: '#878787',
    },
  },
  formWrapper: {
    opacity: '0.9',
    height: '245px',
    padding: '15px',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    justifyItems: 'center',
    textAlign: 'left',
  },
  formGroup: {
    width: '100%',
  },
});

function CustomLabel(text) {
  return <label htmlFor="none" style={{ textAlign: 'left', color: '#BDBDBD' }}>{text}</label>;
}

function CompletePasswordForm() {
  const classes = useStyles();
  const [password, setPassword] = useState();
  const matchCognitoPassword = (thePassword) => {
    const format = /[!@#$%^&*()_+\-=]/;
    if (thePassword.length < 8) {
      return false;
    } if (!format.test(thePassword)) {
      return false;
    } if (!/\d/.test(thePassword)) {
      return false;
    } if (!/[A-Z]/.test(thePassword)) {
      return false;
    }
    return true;
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const passwordValue = document.getElementById('password').value;
    if (passwordValue === '') {
      alert('Le mot de passe ne peut pas être vide.');
    } else if (passwordValue !== document.getElementById('confirm-password').value) {
      alert('Les mots de passe ne correspondent pas !');
    } else if (!matchCognitoPassword(passwordValue)) {
      alert(
        'Le mot de passe doit : \n'
        + ' - avoir au moins 8 caractères \n'
        + ' - avoir au moins une majuscule \n'
        + ' - avoir au moins un caractère spécial !@#$%^&*()_+-= \n'
        + ' - avoir au moins un chiffre',
      );
    } else {
      authProvider.setNewPassword(password);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className={classes.formWrapper}>
        <div style={{
          color: '#000000', textAlign: 'center', fontWeight: 'bold', fontSize: '1.4em',
        }}
        >
          Première connexion ?
        </div>
        <hr />
        <div className={classes.formGroup}>
          {CustomLabel('Entrez votre nouveau mot de passe')}
          <input
            className={classes.textInput}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            id="password"
          />
        </div>
        <div className={classes.formGroup}>
          {CustomLabel('Confirmez votre nouveau mot de passe')}
          <input className={classes.textInput} type="password" id="confirm-password" />
        </div>
        <div className={classes.formGroup}>
          <input value="Enregistrer" type="submit" className={classes.submitInput} />
        </div>
      </div>
    </form>
  );
}
function CompletePasswordPage() {
  return (
    <center style={{ paddingTop: '10%' }}>
      <CompletePasswordForm />
    </center>
  );
}
export default CompletePasswordPage;
