import { z } from 'zod';

export const FieldErrorMessage = {
  phone: 'Le numéro de téléphone ne doit contenir que des chiffres',
  accountPhone: "Veuillez entrer un numéro de téléphone valide, en utilisant uniquement des chiffres, espaces, slashes '/' ou tirets '-'",
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
  minNumberNotValid: 'La valeur minimale autorisée est 0',
  maxRatingNotValid: 'La valeur maximale autorisée est 10',
  shouldChoose: 'Veuillez sélectionner une option.',
  noParticipant: 'Veuillez ajouter au moins un/une participant(e).',
};

export const requiredString = () => z.string({ required_error: FieldErrorMessage.required });

export const requiredStringCustom = () => z.custom(str => str && `${str}`.length > 0, { message: FieldErrorMessage.required }).transform(str => `${str}`);

export const requiredRating = () =>
  requiredString()
    .transform(value => parseFloat(value.replace(',', '.')))
    .refine(value => value >= 0, { message: FieldErrorMessage.minNumberNotValid });

export const requiredNumberRows = () =>
  requiredString()
    .transform(value => parseInt(value, 10))
    .refine(value => value >= 0, { message: FieldErrorMessage.minNumberNotValid });

export const phoneValidator = (phoneNumber: string) => /^[0-9\s+/-]*$/.test(phoneNumber);

export const requiredArray = () => z.string({ required_error: FieldErrorMessage.required }).array().nonempty({ message: FieldErrorMessage.required });
export const emailValidator = z.string().email({ message: FieldErrorMessage.emailNotValid });
