import { z } from 'zod';

export const FieldErrorMessage = {
  phone: 'Le numéro de téléphone ne doit contenir que des chiffres',
  emailNotValid: 'Email non valide',
  townCodeNotValid: 'Le code de la commune de prospection doit être à 5 chiffres.',
  linkNotValid: 'Lien non valide',
  required: 'Ce champ est requis.',
  emptyPassword: 'Le mot de passe ne peut pas être vide.',
  notMatchingPassword: 'Les mots de passe ne correspondent pas !',
  minPassword: 'Le mot de passe doit contenir au moins 8 caractères.',
  phoneLength: 'Le numéro de téléphone doit contenir exactement dix (10) chiffres.',
  badPassword:
    'Le mot de passe doit : \n - avoir au moins une majuscule \n - avoir au moins un caractère spécial !@#$%^&*()_+-= \n - avoir au moins un chiffre',
  resetCode: 'Le code de validation est incorrect',
  shouldChoose: 'Veuillez sélectionner une option.',
};

export const requiredString = () => z.string({ required_error: FieldErrorMessage.required }).nonempty({ message: 'Ce champ est requis.' });
export const phoneValidator = (phoneNumber: string) => !/[^0-9/+]/.test(phoneNumber);
