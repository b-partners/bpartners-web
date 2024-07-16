import BREAD_LOGO from '@/assets/logo-bred.png';
import { SxProps, Theme } from '@mui/material';

type Message = {
  message: string;
  color?: string;
  type?: 'bold' | 'italique';
};

export type Partner = {
  headerMessage: Message[];
  imageSrc: string;
  bodyMessage: Message[];
  buttonLabel: string;
  cornerPosition: SxProps<Theme>;
  redirectionLink: string;
};

export const partners: Partner[] = [
  {
    headerMessage: [
      {
        message: "Besoin d'un ",
      },
      {
        message: 'compte bancaire ?',
        color: '#F2C30C',
      },
    ],
    imageSrc: BREAD_LOGO,
    bodyMessage: [
      {
        message: 'Découvrez la BRED, la banque 100% conseil.',
      },
    ],
    buttonLabel: 'Je découvre la BRED',
    cornerPosition: {
      top: 0,
      left: 0,
      transform: 'rotate(45deg) translateX(-75%)',
    },
    redirectionLink:
      'https://www.bred.fr/professionnels-associations/ouvrir-un-compte-pro?utm_medium=referral&utm_source=bpartners.app&utm_campaign=RE_bpartners&utm_content=ban_compte-bancaire',
  },
  {
    headerMessage: [{ message: "Besoin d'une assurance adaptée", color: '#F2C30C' }, { message: 'À votre activité professionnelle ?' }],
    imageSrc: BREAD_LOGO,
    bodyMessage: [
      {
        message: "Découvrez l'assurance",
      },
      {
        message: 'multirisque pro!',
        type: 'bold',
      },
    ],
    buttonLabel: 'Je fais une simulation',
    cornerPosition: {
      bottom: 0,
      left: 0,
      transform: 'rotate(45deg) translateY(75%)',
    },
    redirectionLink:
      'https://www.bred.fr/professionnels-associations/assurance/assurance-des-biens/assurance-multirisque-pro?utm_medium=referral&utm_source=bpartners.app&utm_campaign=RE_bpartners&utm_content=ban_assurance-pro',
  },
];
