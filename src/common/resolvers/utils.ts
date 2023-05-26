import { z } from 'zod';

export const FieldErrorMessage = {
  phone: 'Le numéro de téléphone ne doit contenir que des chiffres',
  emailNotValid: 'Email non valide',
  townCodeNotValid: 'Le code de la commune de prospection doit être à 5 chiffres.',
};

export const requiredString = () => z.string({ required_error: 'Ce champ est requis.' }).nonempty({ message: 'Ce champ est requis.' });
export const phoneValidator = (phoneNumber: string) => !/[^0-9+]/.test(phoneNumber);
